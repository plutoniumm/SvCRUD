<script>
	import axios from "redaxios";
	import { fly } from "svelte/transition";
	import {
		Button,
		ButtonGroup,
		Col,
		Row,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader,
		Input,
		Label,
		Table,
	} from "sveltestrap";
	import { onMount } from "svelte";

	var books = [];
	var addBookForm = {
		title: "",
		author: "",
		description: "",
	};
	var editForm = {
		_id: "",
		title: "",
		author: "",
		description: "",
	};
	let mongoactive = true;
	let postgresactive = false;
	let redisactive = false;
	let esactive = false;
	let currentdb = "mongo";
	function setMongo() {
		books = [];
		mongoactive = true;
		postgresactive = false;
		redisactive = false;
		esactive = false;
		currentdb = "mongo";
		getBooks();
	}

	function setPostgres() {
		books = [];
		mongoactive = false;
		postgresactive = true;
		redisactive = false;
		esactive = false;
		currentdb = "postgres";
		getBooks();
	}

	function setRedis() {
		books = [];
		mongoactive = false;
		postgresactive = false;
		redisactive = true;
		esactive = false;
		currentdb = "redis";
		getBooks();
	}

	function setEs() {
		books = [];
		mongoactive = false;
		postgresactive = false;
		redisactive = false;
		esactive = true;
		currentdb = "es";
		getBooks();
	}

	function getBooks() {
		axios.get(`/books/${currentdb}`).then((res) => {
			books = res.data;
		});
	}

	function removeBook(bookID) {
		const path = `/books/${currentdb}/${bookID.book._id}`;
		axios
			.delete(path)
			.then(() => {
				getBooks();
			})
			.catch((error) => {
				console.error(error);
				getBooks();
			});
	}

	function initForm() {
		addBookForm.title = "";
		addBookForm.author = "";
		addBookForm.description = "";
		editForm._id = "";
		editForm.title = "";
		editForm.author = "";
		editForm.description = "";
	}

	function addBook() {
		const payload = {
			title: addBookForm.title,
			author: addBookForm.author,
			description: addBookForm.description,
		};
		const path = `/books/${currentdb}`;
		axios
			.post(path, payload)
			.then(() => {
				getBooks();
			})
			.catch((error) => {
				console.log(error);
				getBooks();
			});
		addtoggle();
	}

	function editBook(book) {
		updatetoggle();
		editForm = book.book;
	}

	function updateBook() {
		const payload = {
			title: editForm.title,
			author: editForm.author,
			description: editForm.description,
		};
		const path = `/books/${currentdb}/${editForm._id}`;
		axios
			.put(path, payload)
			.then(() => {
				getBooks();
			})
			.catch((error) => {
				console.error(error);
				getBooks();
			});
		updatetoggle();
	}
	onMount(getBooks);
	let addopen = false;

	function addtoggle() {
		initForm();
		addopen = !addopen;
	}
	let updateopen = false;

	function updatetoggle() {
		initForm();
		updateopen = !updateopen;
	}
</script>

<div>
	<div class="row">
		<div class="col-sm-12">
			<h1>Books</h1>
			<hr />
			<br />
			<Button color="success" on:click={addtoggle}>Add Book</Button>
			<span style="float: right;">
				<ButtonGroup>
					<Button
						color="success"
						active={mongoactive}
						outline={!mongoactive}
						on:click={setMongo}>MongoDB</Button
					>
					<Button
						color="primary"
						active={postgresactive}
						outline={!postgresactive}
						on:click={setPostgres}>PostgreSQL</Button
					>
					<Button
						color="primary"
						active={esactive}
						outline={!esactive}
						on:click={setEs}>ElasticSearch</Button
					>
					<Button
						color="danger"
						active={redisactive}
						outline={!redisactive}
						on:click={setRedis}>Redis</Button
					>
				</ButtonGroup>
			</span>
			<br /><br />
			<Table hover>
				<thead>
					<tr>
						<th scope="col">Title</th>
						<th scope="col">Author</th>
						<th scope="col">Description</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{#each books as book}
						<tr transition:fly={{ y: 48, duration: 200 }}>
							<td>{book.title}</td>
							<td>{book.author}</td>
							<td>{book.description}</td>
							<td
								><span style="float: right;">
									<Button
										color="warning"
										on:click={editBook({ book })}
										>Update</Button
									>
									<Button
										color="danger"
										on:click={removeBook({ book })}
										>Delete</Button
									>
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</Table>
		</div>
	</div>
	<Modal isOpen={addopen} {addtoggle}>
		<ModalHeader {addtoggle}>Add a new book</ModalHeader>
		<ModalBody>
			<Label for="newTitle">Title:</Label>
			<Input
				type="text"
				bind:value={addBookForm.title}
				placeholder="book title"
			/>
			<p />
			<Label for="newAuthor">Author:</Label>
			<Input
				type="text"
				bind:value={addBookForm.author}
				placeholder="book author"
			/>
			<p />
			<Label for="newTitle">Description:</Label>
			<Input
				type="text"
				bind:value={addBookForm.description}
				placeholder="book description"
			/>
		</ModalBody>
		<ModalFooter>
			<Button color="primary" on:click={addBook}>Add book</Button>
			<Button color="secondary" on:click={addtoggle}>Cancel</Button>
		</ModalFooter>
	</Modal>
	<Modal isOpen={updateopen} {updatetoggle}>
		<ModalHeader {updatetoggle}>Update book</ModalHeader>
		<ModalBody>
			<Label for="newTitle">Title:</Label>
			<Input
				type="text"
				bind:value={editForm.title}
				placeholder="book title"
			/>
			<p />
			<Label for="newAuthor">Author:</Label>
			<Input
				type="text"
				bind:value={editForm.author}
				placeholder="book author"
			/>
			<p />
			<Label for="newTitle">Description:</Label>
			<Input
				type="text"
				bind:value={editForm.description}
				placeholder="book description"
			/>
		</ModalBody>
		<ModalFooter>
			<Button color="primary" on:click={updateBook}>Update</Button>
			<Button color="secondary" on:click={updatetoggle}>Cancel</Button>
		</ModalFooter>
	</Modal>
</div>

<style>
	:global(body) {
		background: #f5f5f7;
	}
</style>
