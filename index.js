

class Model{
    constructor(){
        //помещаем  в localstorage массив todos
        this.todos =JSON.parse(localStorage.getItem('todos')) || [];
    }

    // Обновляем LocalStorage
    _commit(todos){
        this.onTodoListChanged(todos);
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // функция callback для обновляения LocalStorage

    bindTodoListChanged(callback) {
        this.onTodoListChanged = callback
    }

    addTodo(todoText){
        const todo ={
            id: this.todos.length >0 ? this.todos[this.todos.length - 1].id + 1 : 1,
            text: todoText,
            complete: false,
        }

        this.todos.push(todo);
        this._commit(this.todos);
        //console.log(this.todos);
    }

    editTodo(id, updatedText){
        this.todos = this.todos.map(todo =>
            todo.id === id ? { id: todo.id, text: updatedText, complete: todo.complete} :todo
         )
         this._commit(this.todos);
    }

    deleteTodo(id){
        this.todos = this.todos.filter( todo => todo.id !== id);
        this._commit(this.todos);
    }


    toggleTodo(id){
        this.todos = this.todos.map(todo => 
            todo.id === id ? {id: todo.id, text: todo.text, complete: !todo.complete}: todo
         )
       
         this._commit(this.todos);
         console.log(this.todos);
    }
}



class View {
    constructor() {

        //the root element
        this.app = this.getElement('#root');

        //the title of the app
        this.title = this.createElement('h1');
        this.title.textContent = 'Todos';

        // The form, with a [type="text"] input, and a submit button
        this.form = this.createElement('form');

        this.input = this.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Add todo';
        this.input.name =' todo';

        this.submitButton = this.createElement('button');
        this.submitButton.textContent = 'submit';

        // The visual representation of the todo list

        this.todosList = this.createElement('ul', 'todo-list');

         // Append the input and submit button to the form
        this.form.append(this.input, this.submitButton);

        this.app.append(this.title, this.form, this.todosList);

        this._temporaryTodoText;
        this._initLocalListeners();


    }

    //// Update temporary state (Для обновления текста внутри task)

    _initLocalListeners(){
        this.todosList.addEventListener('input', e => {
            if(e.target.className === 'editable'){
                this._temporaryTodoText = e.target.innerText;
            }
        })
    }

    createElement(tag, className){
        const element = document.createElement(tag);
        if(className) element.classList.add(className)

        return element;
    }

    getElement(selector){
        const element = document.querySelector(selector);
        return element;
    }

    deleteTodo(id){
        this.todos = this.todos.filter(todo => todo.id !== id);

        this.onTodoListChanged(this.todos);
    }

    get _todoText(){
        return this.input.value;
    }

    _resetInput(){
        this.input.value = '';
    }


    displayTodos(todos){

        while(this.todosList.firstChild){
           this.todosList.removeChild(this.todosList.firstChild)
        }

        if(todos.length === 0){
            const p = this.createElement('p');
            p.textContent = 'Nothing to do! Add a task?'
            this.todosList.append(p);
        } else {

            // Create todo item nodes for each todo in state
                todos.forEach(todo => {
                   const li = this.createElement('li');
                   li.id =todo.id 
                // Each todo item will have a checkbox you can toggle
                   const checkbox = this.createElement('input');
                   checkbox.type = 'checkbox';
                   checkbox.checked = todo.complete;
                    
                // The todo item text will be in a contenteditable span
                    const span = this.createElement('span');
                    span.contentEditable = true;
                    span.classList.add('editable');

                // If the todo is complete, it will have a strikethrough

                    if(todo.complete){
                        const strike = this.createElement('s');
                        strike.textContent = todo.text;
                        span.append(strike)
                    }else {
                        span.textContent = todo.text;
                    }

                    const deleteButton = this.createElement('button', 'delete');
                    deleteButton.textContent = 'Delete';

                    li.append(checkbox, span, deleteButton);
                    this.todosList.append(li)


                 });
        }
    }

    
    bindEditTodo(handler){
        this.todosList.addEventListener( 'focusout', (e) => {
            if(this._temporaryTodoText){
                const id = parseInt(event.target.parentElement.id)
                handler(id, this._temporaryTodoText);
                this._temporaryTodoText = '';
            }
        })
    }


    bindAddTodo(handler){
        this.form.addEventListener('submit', e => {
            e.preventDefault();

            if(this._todoText) {
                handler(this._todoText);
                this._resetInput();
            }
        });
    }

    bindDeleteTodo(handler){
        this.todosList.addEventListener('click', e => {
            if(e.target.className === 'delete') {
                const id = parseInt(e.target.parentElement.id);
                handler(id);
            }
        });
    }

    bindToggleTodo(handler){
        this.todosList.addEventListener('change', e => {
            if (e.target.type === 'checkbox'){
                const id = parseInt(e.target.parentElement.id);

                handler(id);
            }
        });
    }
    
}


class Controller {
    constructor(model, view){
        this.model = model;
        this.view = view;

        this.onTodoListChanged(this.model.todos)

        this.model.bindTodoListChanged((todos) =>
             this.view.displayTodos(todos));

        this.view.bindAddTodo( (todoText) =>   
            this.model.addTodo(todoText));

        this.view.bindEditTodo((id, todoText) => 
            this.model.editTodo(id, todoText));

        this.view.bindDeleteTodo((id) =>
             this.model.deleteTodo(id));

        this.view.bindToggleTodo( (id) =>
            this.model.toggleTodo(id));
    }

    onTodoListChanged = todos => 
        this.view.displayTodos(todos);

}

// создаем наже MVC приложение
const app = new Controller( new Model(), new View());

// рисуем UI для пользователя

app.view.displayTodos(app.model.todos);
