
function showDivisionsWithDelay() {
    const cardDivisions = document.querySelectorAll(".card");
    const delay = 300;

    cardDivisions.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = 1;
        }, (index + 1) * delay);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('duedate').valueAsDate = new Date();
    const taskContainer = document.getElementById("TaskContainer");
    const addButton = document.querySelector(".bx-plus");
    const textInput = document.getElementById("todo");
    const dateInput = document.getElementById("duedate");
    const myDayLink = document.getElementById("o1");
    const thisWeekLink = document.getElementById("o2");
    const thisMonthLink = document.getElementById("o3");
    const otherLink = document.getElementById("o4");
    const titleLink = document.getElementById("header_title");

    const generateNumericID = () => {
        return Date.now() + Math.floor(Math.random() * 1000);
    };

    const saveData = () => {
        const taskDescription = textInput.value;
        const dueDate = dateInput.value;

        if (taskDescription.trim() === "" || dueDate === "") {
            swal({
                title: "Error",
                text: "Please enter both task and due date!",
                icon: "error",
            });
        } else {
            const id = generateNumericID();

            const task = {
                id: id,
                text: taskDescription,
                date: dueDate,
                completed: false,
                timestamp: Date.now(), 
            };

            const taskData = JSON.stringify(task);

            localStorage.setItem(id, taskData);
            textInput.value = "";
            dateInput.value = "";
            displayTasks(currentSection);
        }
    };

    addButton.addEventListener("click", saveData);
    textInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            saveData();
        }
    });
    dateInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            saveData();
        }
    });

    const isToday = (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        return date.toDateString() === today.toDateString();
    };

    const displayTasks = (section, tasksToDisplay) => {
        currentSection = section;
        const tasks = Object.entries(localStorage)
        .filter(([key]) => key !== "userPreferences")
        .map(([, tasks]) => JSON.parse(tasks));
        const tasksToRender = tasksToDisplay || tasks;
        tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        const todayDate = new Date().toLocaleDateString("en-CA");
        const filteredTasks = tasksToRender.filter((task) => {
            switch (section) {
                case "myDay":
                    titleLink.textContent = "My Day";
                    return task.date === todayDate;
                case "thisWeek":
                    titleLink.textContent = "Current Week";
                    const getStartOfWeek = (date) => {
                        const day = date.getDay();
                        return new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate() - day
                        );
                    };

                    const getEndOfWeek = (date) => {
                        const day = date.getDay();
                        return new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate() + (6 - day)
                        );
                    };

                    const today = new Date();
                    const startOfWeek = getStartOfWeek(today);
                    const endOfWeek = getEndOfWeek(today);

                    const taskDate = new Date(task.date); // Convert task.date to a Date object for comparison

                    return taskDate >= startOfWeek && taskDate <= endOfWeek;
                case "thisMonth":
                    titleLink.textContent = "Current Month";
                    const getStartOfMonth = (date) => {
                        return new Date(date.getFullYear(), date.getMonth(), 1);
                    };

                    const getEndOfMonth = (date) => {
                        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
                    };
                    const startOfMonth = getStartOfMonth(new Date());
                    const endOfMonth = getEndOfMonth(new Date());
                    return (
                        task.date >= startOfMonth.toISOString().slice(0, 10) &&
                        task.date <= endOfMonth.toISOString().slice(0, 10)
                    );
                case "other":
                    titleLink.textContent = "All tasks";
                    return true;
                default:
                    return false; 
            }
        });

        taskContainer.innerHTML = filteredTasks
            .map(
                (task) => `
          <div class="card align" data-task-id="${task.id}">
            <input type="checkbox" name="task" id="${task.id}" ${task.completed ? "checked" : ""
                    }>
            <div ${task.completed ? 'class="marker done"' : 'class="marker"'}>
              <span>${task.text}</span>
              <p id="taskDate" class="date ${isToday(task.date) ? "today" : ""}">${isToday(task.date)
                        ? "Today"
                        : "<i class='bx bx-calendar-alt'></i> " + task.date
                    }</p>      
                <input type="date" id="hiddenDatePicker" style="display: none;" />        
            </div>
            <i class="bx bx-trash-alt"></i>
          </div>
        `
            )
            .join("");

        const searchInput = document.getElementById("search");


        const handleSearch = () => {
            toggleMenu();
            const searchText = searchInput.value.trim().toLowerCase();
            if (searchText !== "") {

                const filteredTasks = tasks.filter((task) =>
                    task.text.toLowerCase().includes(searchText)
                );
                displayTasks(currentSection, filteredTasks);
            } else {
 
                displayTasks(currentSection);
            }
        };
        
        

        const keydownHandler = (event) => {
            if (event.key === "Enter") {
                handleSearch();
                searchInput.removeEventListener("keydown", keydownHandler);
            }
        };
        

        searchInput.addEventListener("keydown", keydownHandler);
        taskContainer.addEventListener("click", (event) => {
   
            if (event.target.type === "checkbox" && event.target.name === "task") {
                const taskId = event.target.id;
                const task = tasks.find((task) => task.id.toString() === taskId);
                if (task) {
                    task.completed = event.target.checked;
                    localStorage.setItem(task.id, JSON.stringify(task));
                    const marker = event.target.nextElementSibling;
                    if (marker.classList.contains("marker")) {
                        marker.classList.toggle("done", task.completed);
                    }
                }
            }
            if (event.target.classList.contains("bx-trash-alt")) {
                const taskId = event.target.closest(".card").dataset.taskId;
                swal({
                    title: "Delete current task?",
                    text: "Once deleted, you will not be able to recover this task!",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        localStorage.removeItem(taskId);
                        event.target.closest(".card").remove();
                        swal("Poof! Your task has been deleted!", {
                            icon: "success",
                        });
                    }
                });
            }

            if (event.target.classList.contains("date")) {
                const taskId = event.target.closest(".card").dataset.taskId;
                const task = tasks.find((task) => task.id.toString() === taskId);
        
                if (task) {
                    document.getElementById('hiddenDatePicker').showPicker();
                    document.getElementById('hiddenDatePicker').addEventListener('change', function () {
                        const selectedDate = this.value;

                        swal({
                            title: "Are you sure?",
                            text:  `Update the due date from ${task.date} to ${selectedDate}.`,
                            icon: "info",
                            buttons: ["Cancel", "Yes"],
                        }).then((willChangeDate) => {
                            if (willChangeDate) {
                                task.date = selectedDate;
                                localStorage.setItem(taskId, JSON.stringify(task));
                                displayTasks(currentSection);
                            } else {
                             
                                document.getElementById('hiddenDatePicker').value = '';
                            }
                        });
                    });
                }
            }
        });
        showDivisionsWithDelay();
    };

    const buttonsDiv = document.querySelector(".buttons");
    buttonsDiv.addEventListener("click", () => {
        swal({
            title: "Delete all data?",
            text: "Once deleted, you will not be able to recover this data!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                const keys = Object.keys(localStorage);  
                const keysToKeep = keys.filter(key => key !== "userPreferences");

                keysToKeep.forEach(key => localStorage.removeItem(key));

                taskContainer.innerHTML = "";
                swal("All data has been deleted!", {
                    icon: "success",
                });
            }
        });
    });    
    const logoutLink = document.getElementById("logoutLink");
    logoutLink.addEventListener("click", () => {
        swal({
            title: "Are you sure?",
            text: "Logging out will delete your profile name and email.",
            icon: "warning",
            buttons: ["Cancel", "Logout"],
            dangerMode: true,
        }).then((willLogout) => {
            if (willLogout) {
                localStorage.removeItem("userPreferences");

                window.location.reload();
            } else {
            }
        });
    });
    
    function getUserPreferences() {
        const storedPreferences = localStorage.getItem("userPreferences");
        const defaultPreferences = {
            name: "Tan",
            email: "tan@gmail.com",
        };

        return storedPreferences
            ? JSON.parse(storedPreferences)
            : defaultPreferences;
    }

    function setUserPreferences(name, email) {
        const preferences = { name, email };
        localStorage.setItem("userPreferences", JSON.stringify(preferences));
    }

    function promptForNameAndEmail() {
        swal({
            title: "Enter your information",
            content: {
                element: "div",
                attributes: {
                    innerHTML: `
          <div class="form__group field">
            <input type="input" class="form__field" placeholder="Name" id="swal-input-name" required="">
            <label for="swal-input-name" class="form__label">Name</label>
          </div>
          <div class="form__group field">
            <input type="input" class="form__field" placeholder="Email" id="swal-input-email" required="">
            <label for="swal-input-email" class="form__label">Email</label>
          </div>
        `,
                },
            },
            buttons: {
                cancel: "Cancel",
                confirm: "Save",
            },
            closeOnClickOutside: false,
        }).then((result) => {
            if (result && result.dismiss !== "cancel") {
                const name = document.getElementById("swal-input-name").value;
                const email = document.getElementById("swal-input-email").value;
                const finalName = name || "Tan ";
                const finalEmail = email || "tan@gmail.com";

                setUserPreferences(finalName, finalEmail);
                displayProfileData();
            }
        });
    }
    function displayProfileData() {
        const preferences = getUserPreferences();

        const nameElement = document.getElementById("name");
        const emailElement = document.getElementById("email");

        nameElement.textContent = preferences.name;
        emailElement.textContent = preferences.email;
    }
    const preferences = getUserPreferences();

    if (
        preferences.name === "Tan" &&
        preferences.email === "tan@gmail.com"
    ) {
        promptForNameAndEmail();
    }
    displayProfileData();

const handleSectionLinkClick = (section, linkElement) => {
    displayTasks(section);
    toggleMenu();
    linkElement.removeEventListener("click", () => handleSectionLinkClick(section, linkElement));
};
myDayLink.addEventListener("click", function () { handleSectionLinkClick("myDay", myDayLink); });
thisWeekLink.addEventListener("click", function () { handleSectionLinkClick("thisWeek", thisWeekLink); });
thisMonthLink.addEventListener("click", function () { handleSectionLinkClick("thisMonth", thisMonthLink); });
otherLink.addEventListener("click", function () { handleSectionLinkClick("other", otherLink); });

    let currentSection = "myDay";
    displayTasks(currentSection);


    const burgerIcon = document.getElementById('burgerIcon');
    const containerLeft = document.getElementById('containerLeft');
  
    var toggleMenu = () => {
        containerLeft.classList.toggle('v-class');
        burgerIcon.classList.toggle('cross');
    };

    burgerIcon.addEventListener('click', toggleMenu);

    document.body.addEventListener('click', (event) => {
        const target = event.target;
        if (!containerLeft.contains(target) && !burgerIcon.contains(target)) {
            containerLeft.classList.remove('v-class');
            burgerIcon.classList.remove('cross');
        }
    });
});

