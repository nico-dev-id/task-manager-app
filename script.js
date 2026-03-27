//1. ELEMENT
const input = document.querySelector("#todo-input");
const button = document.querySelector("#add-btn");
const list = document.querySelector("#todo-list");
const allBtn = document.querySelector("#filter-all");
const activeBtn = document.querySelector("#filter-active");
const doneBtn = document.querySelector("#filter-done");
const taskCount = document.querySelector("#task-count");
const clearBtn = document.querySelector("#clear-all");

//2. DATA
let todos = [];
let filter = "all"; 

//3. INIT (LOAD DATA)
function loadData(){
    const saved = localStorage.getItem("todos");
    if (saved){
        todos = JSON.parse(saved);

        //console.log("Load data dari todos");
    }
}

//4. FUNCTION
//===== FUNCTION SAVE DATA ======
function saveData(){
    localStorage.setItem("todos", JSON.stringify(todos));
    //console.log("Data Disimpan");
}

//===== FUNCTION RENDER TODOS =======
function renderTodos(){
    list.innerHTML = ""; //1

    updateTaskCount(); 

    //filter
    let filteredTodos = todos; 

    if (filter === "active"){
        filteredTodos = todos.filter(todo => !todo.done);
    } else if(filter === "completed"){
        filteredTodos = todos.filter(todo => todo.done);
    }

    filteredTodos.forEach(function(todo){ 
        const li = document.createElement("li"); 

        //checkbok
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox"; 
        checkbox.checked = todo.done; 

        const span = document.createElement("span");
        span.textContent = todo.text; 

        //handle doble klik untuk edit data
        span.addEventListener("dblclick", () => {
            const input = document.createElement("input");
            input.type = "text";
            input.value = todo.text;

            let isCancelled = false; //flag

            span.replaceWith(input);
            input.focus();
            input.select();

            input.addEventListener("blur", () => {
                if (isCancelled) return; //ESC jangan save
                if (input.value.trim() === "") return;

                todo.text = input.value;
                updateApp();
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

        if(todo.done){
            span.classList.add("done");
        }

        //delete
        const btn = document.createElement("button");
        btn.textContent = "X"; //6

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(btn);

        list.appendChild(li);

        //console.log(todo.text);
    });
}

//==== FUNCTION UPDATE DATA ====
function updateApp() {
    saveData();
    renderTodos();
}

//====== FUNCTION ADD TODO ========
function addTodo(){
    const value = input.value;
    if (!value.trim()){
        alert("input cannot be empty! 😴");
        return;
    } 

    todos.push({
        text: value,
        done: false
    });
    updateApp();

    input.value = "";
    input.focus();
}

//==== FUNCTION WARNA FILTER BUTTON =====
function setActiveButton(btn){
    allBtn.classList.remove("active");
    activeBtn.classList.remove("active");
    doneBtn.classList.remove("active");
    btn.classList.add("active");
}

//==== FUNCTION TULISAN SISA TASK =====
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

//5. EVENT
//==== EVENT TOMBOL TAMBAH ====
button.addEventListener("click", addTodo);
//console.log(todos);

//ENTER UNTUK TAMBAH
input.addEventListener("keydown", function(e){
    if (e.key === "Enter"){
        //console.log("Enter ditekan");
        addTodo();
    }
});

//====== CEKBOX ======
list.addEventListener("change", function(e){
    if (e.target.type === "checkbox"){
        //console.log("Checkbox ditekan");

        const li = e.target.parentElement;
        const index = Array.from(list.children).indexOf(li);

        todos[index].done = e.target.checked;
        
        //console.log("index", index);
        //console.log(todos);

        updateApp();
    }
});

//===== EVENT TOMBOL DELETE =====
list.addEventListener("click", function(e){
    if (e.target.tagName === "BUTTON"){
        //console.log("Tombol Delete Ditekan");

        const li = e.target.parentElement;
        const index = Array.from(list.children).indexOf(li);

        //handel delet dgn animasi sebelum hapus data
        li.classList.add("fade-out"); 
        
        const ANIMATION_DURATION = 200;
        setTimeout(() => {
            todos.splice(index, 1); 
            updateApp();
        }, ANIMATION_DURATION);
    }
});

//==== EVENT TOMBOL CLEAR ALL =====
clearBtn.addEventListener("click", () => {
    const confirmClear = confirm("Delete all tasks?");

    if (confirmClear) {
        todos = [];

        localStorage.removeItem("todos");
        renderTodos();
        updateTaskCount();
    }
});

//====== FILTER BUTTON =======
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

//6. RENDER AWAL
loadData();
renderTodos();
setActiveButton(allBtn);