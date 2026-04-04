//=========================================
//              SELECT ELEMENT
//=========================================
const input = document.querySelector("#todo-input");
const button = document.querySelector("#add-btn");
const list = document.querySelector("#todo-list");
const allBtn = document.querySelector("#filter-all");
const activeBtn = document.querySelector("#filter-active");
const doneBtn = document.querySelector("#filter-done");
const taskCount = document.querySelector("#task-count");
const clearBtn = document.querySelector("#clear-all");
const loading = document.querySelector("#loading");

//==========================================
//             DATA / STATE
//==========================================
let todos = [];
let filter = "all"; 
let draggedItem = null;

//==========================================
//              FUNCTION
//==========================================

//      ===== FUNCTION SAVE DATA ======
function saveData(){
    localStorage.setItem("todos", JSON.stringify(todos));
    //console.log("Data Disimpan");
}

//      ===== FUNCTION LOAD DATA =====
function loadData(){
    const saved = localStorage.getItem("todos");
    if (saved){
        todos = JSON.parse(saved);

        //tambah id jika belum ada
        todos = todos.map(todo => {
            if (!todo.id) {
                return {
                    ...todo,
                    id:Date.now() + Math.random()
                };
            }
            return todo;
        });
        //console.log("Load data dari todos");
    }
}

//      ==== FUNCTION FILTER ====
function getFilteredTodos() {
    if (filter === "active") {
        return todos.filter(todo => !todo.done);
    } else if (filter === "completed") {
        return todos.filter(todo => todo.done);
    }
    return todos;
}

//      ==== HANDLE CHECKBOX ====
function creatCheckbox(todo) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox"; 
        checkbox.checked = todo.done;
        return checkbox;
}

//      ==== HANDLE TEXT TODO ====
function creatTodoText(todo) {
    const span = document.createElement("span");
    span.textContent = todo.text;
        if (todo.done) {
            span.classList.add("done");
        }
        return span;
}

//      ==== HANDLE DELETE ====
function creatDeleteButton(todo) {
    const btn = document.createElement("button");
    btn.textContent = "X";
    return btn;
}

//      ==== HANDLE DOUBLE KLIK EDIT ====
function attachEditEvent(span, todo) {
    span.addEventListener("dblclick", () => {
            const input = document.createElement("input");
            input.type = "text";
            input.value = todo.text;

            let isCancelled = false; //flag

            span.replaceWith(input);
            input.focus();
            input.select();

            input.addEventListener("blur", () => {
                if (isCancelled) return; //ESC Batal atau jangan save
                if (input.value.trim() === "") return;

                todo.text = input.value;
                syncApp();
            });

            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    input.blur();
                }
                if (e.key === "Escape") {
                    isCancelled = true; //tandai cancel

                    renderTodos();
                }
            });
        });
}

//      ==== HENDLE DRAG DAN DROP ====
function attachDragEvents(li) {
    li.setAttribute("draggable", true);
        li.addEventListener("dragstart", () => {
            draggedItem = li;
            li.style.opacity = "0.5";
            //console.log(draggedItem);

            //garis hilang saat batal pindah item
            li.addEventListener("dragend", () => {
                li.style.opacity = "1";
                document.querySelectorAll("#todo-list li").forEach(item => {
                    item.style.borderTop = "";
                    item.style.borderBottom = "";
                });
            });

            li.addEventListener("dragover", (e) => {
                e.preventDefault();
                const bounding = li.getBoundingClientRect();
                const offset = e.clientY - bounding.top;
                const middle =bounding.height / 2;

                if (offset > middle) {
                    li.style.borderBottom = "2px solid #4f46e5";
                    li.style.borderTop = "";
                } else {
                    li.style.borderTop = "2px solid #4f46e5";
                    li.style.borderBottom = "";
                }
                //console.log(offset, middle);
            });

        //handle item pindah saat di drag
        li.addEventListener("drop", (e) => {
            e.preventDefault();
            if (draggedItem === li) return;

            const list = li.parentElement;

            const bounding = li.getBoundingClientRect();
            const offset = e.clientY - bounding.top;
            const middle = bounding.height / 2;

            if (offset > middle) {
                list.insertBefore(draggedItem, li.nextSibling);
            } else {
                list.insertBefore(draggedItem, li);
            }
            updateOrder();

            //garis hilang saat pindah item
            document.querySelectorAll("#todo-list li").forEach(item => {
                item.style.borderTop ="";
                item.style.borderBottom = ""; 
            });
        });
    });
}

//       ==== FUNCTION CREAT ELEMENT TODO ====
function createTodoElement(todo) {
    const li = document.createElement("li"); 
        li.dataset.id = todo.id;

        const checkbox = creatCheckbox(todo); //cekbox
        const span = creatTodoText(todo); //todo text
        const btn = creatDeleteButton(todo); //delete
        attachDragEvents(li); //drag item
        attachEditEvent(span, todo); //double clik edit

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(btn);
        list.appendChild(li);

        return li;
        //console.log(todo.text);
        //console.log("ID:", todo.id, "TEXT:", todo.text);
}

//      ===== FUNCTION RENDER TODOS =======
function renderTodos(){
    loading.style.display = "block";

    list.innerHTML = "";
    updateTaskCount(); 

    const filteredTodos = getFilteredTodos(); //filter

    filteredTodos.forEach(todo => { 
        const li = createTodoElement(todo);
        list.appendChild(li);
    });
    loading.style.display = "none"
}

//      ==== FUNCTION UPDATE APP ====
function syncApp() {
    saveData();
    renderTodos();
}

//      ====== FUNCTION ADD TODO ========
function addTodo(){
    const value = input.value;
    if (!value.trim()){
        alert("input cannot be empty! 😴");
        return;
    } 

    todos.push({
        id: Date.now(),
        text: value,
        done: false
    });
    syncApp();

    input.value = "";
    input.focus();
}

//      ==== FUNCTION UPDATE ORDER ====== 
//unutk drag and drop
function updateOrder(){
    const newOrder = [];
    const items = list.querySelectorAll("li");

    items.forEach(li => {
        const id =Number(li.dataset.id);
        const todo = todos.find(todo => todo.id === id);

        if (todo) {
            newOrder.push(todo);
        }
    });
    todos= newOrder;
    saveData();
}

//      ==== FUNCTION WARNA FILTER BUTTON =====
function setActiveButton(btn){
    allBtn.classList.remove("active");
    activeBtn.classList.remove("active");
    doneBtn.classList.remove("active");
    btn.classList.add("active");
}

//      ==== FUNCTION TULISAN SISA TASK =====
function updateTaskCount(){
    const count = todos.filter(todo => !todo.done).length;
    let message = "";
    if (count === 0){
        message = "No tasks left 🎉";
        taskCount.style.color = "green";
    } else if (count === 1) {
        message = "1 task left";
        taskCount.style.color = "#555";
    } else {
        message = `${count} tasks left`;
    }
    taskCount.textContent = message;
}

//      ==== FUNCTION HANDLE DELETE ====
function handleDelete (id, li) {
    li.classList.add("fade-out"); 
        
        const ANIMATION_DURATION = 200;
        setTimeout(() => {
            todos = todos.filter(todo => todo.id !== id); 
            syncApp();
        }, ANIMATION_DURATION);
}

//      ==== FUNCTION HANDLE CLEAR ALL ====
function handleClearAll() {
    const confirmClear = confirm("Delete all tasks?");

    if (confirmClear) {
        todos = [];

        localStorage.removeItem("todos");
        syncApp();
        updateTaskCount();
    }
}

//====================================
//              EVENT
//====================================

//      ==== EVENT TOMBOL TAMBAH ====
button.addEventListener("click", addTodo);
//console.log(todos);

//ENTER UNTUK TAMBAH
input.addEventListener("keydown", function(e){
    if (e.key === "Enter"){
        //console.log("Enter ditekan");
        addTodo();
    }
});

//      ====== CEKBOX ======
list.addEventListener("change", function(e){
    if (e.target.type === "checkbox"){
        //console.log("Checkbox ditekan");
        const li = e.target.parentElement;

        const id = Number(li.dataset.id);
        const todo = todos.find(todo => todo.id === id);
        if (todo){
            todo.done = e.target.checked;

            syncApp();
            //console.log(todos);
        }
    }
});

//      ===== EVENT TOMBOL DELETE =====
list.addEventListener("click", function(e){
    if (e.target.tagName === "BUTTON"){
        //console.log("Tombol Delete Ditekan");
        const li = e.target.parentElement;

        const id = Number(li.dataset.id);
        handleDelete(id, li);
    }
});

//      ==== EVENT TOMBOL CLEAR ALL =====
clearBtn.addEventListener("click", handleClearAll);

//      ====== FILTER BUTTON =======
//FILTER ALL
allBtn.addEventListener("click", function(){
    filter = "all";
    setActiveButton(allBtn);
    renderTodos();
});

//FILTER ACTIVE
activeBtn.addEventListener("click", function(){
    filter = "active";
    setActiveButton(activeBtn);
    renderTodos();
});

//FILTER DONE
doneBtn.addEventListener("click", function(){
    filter = "completed";
    setActiveButton(doneBtn);
    renderTodos();
});

//====================================
//              RENDER AWAL
//====================================
loadData();
renderTodos();
setActiveButton(allBtn);