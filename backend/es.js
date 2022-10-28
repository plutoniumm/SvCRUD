const elasticsearch = require( 'elasticsearch' );
const esclient = new elasticsearch.Client( {
  host: 'elasticsearch:9200',
  maxRetries: 5,
  requestTimeout: 30000,
} );

exports.esMigration = function esMigration () {
  esclient.ping( {
    requestTimeout: 30000,
  }, function ( error ) {
    if ( error ) {
      console.error( 'es cluster is down!' );
    } else {
      console.log( 'Connected to ElasticSearch' );
    }
  } );
  esclient.index( {
    index: 'books',
    type: 'book',
    id: '1',
    body: {
      title: 'Elasticsearch: The Definitive Guide',
      author: 'Elastic Search',
      description: 'A Distributed Real-Time Search and Analytics Engine'
    },
    refresh: true
  } );
};

exports.getBooks = async ( req, res, next ) => {
  let return_dataset = [];
  await esclient.search( {
    q: '*'
  } ).then( function ( body ) {
    var hits = body.hits.hits;
    hits.forEach( ( l ) => {
      temp_data = {
        '_id': l._id,
        'title': l._source.title,
        'author': l._source.author,
        'description': l._source.description
      }
      return_dataset.push( temp_data )
    } );
    res.json( return_dataset );
  }, function ( error ) {
    console.trace( error.message );
  } );
};

exports.getBookById = async ( req, res, next ) => {
  await esclient.get( {
    index: 'books',
    type: 'book',
    id: req.params.id
  } ).then( function ( body ) {
    var temp_data = {
      '_id': body._id,
      'title': body._source.title,
      'author': body._source.author,
      'description': body._source.description
    };
    res.json( temp_data );
  }, function ( error ) {
    console.trace( error.message );
  } );
};

exports.postBook = async ( req, res, next ) => {
  const {
    title,
    author,
    description
  } = req.body;
  let id = new Date().getTime();
  await esclient.index( {
    index: 'books',
    type: 'book',
    id: id,
    body: {
      title: title,
      author: author,
      description: description
    },
    refresh: true
  }, function ( err, resp, status ) {
    console.log( resp );
    res.send( 'Success' );
  } );
};

exports.updateBook = async ( req, res, next ) => {
  const {
    title,
    author,
    description
  } = req.body;
  await esclient.update( {
    index: 'books',
    type: 'book',
    id: req.params.id,
    body: {
      doc: {
        title: title,
        author: author,
        description: description
      }
    },
    refresh: true
  }, function ( err, resp, status ) {
    res.send( 'Success' );
  } );
};

exports.deleteBook = async ( req, res, next ) => {
  await esclient.delete( {
    index: 'books',
    type: 'book',
    id: req.params.id,
    refresh: true
  }, function ( err, resp, status ) {
    console.log( resp );
    res.send( 'Success' );
  } );
};
