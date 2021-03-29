document.addEventListener('DOMContentLoaded', () => {
  const toggleDarkMode = document.querySelector('#dark-mode-toggle');
  const body = document.querySelector('body');
  const todosElement = document.querySelector('.todos');
  const form = document.querySelector('.add-todo');
  const input = document.querySelector('.input');
  const itemsLeft = document.querySelector('.items-left');
  const clearCompletedElement = document.querySelector('.clear-completed');

  const disableDarkMode = () => {
    localStorage.setItem('theme', 'light');
    body.classList.remove('dark-mode');
    toggleDarkMode.setAttribute('src', './images/icon-moon.svg');
  };

  const enableDarkMode = () => {
    localStorage.setItem('theme', 'dark');
    body.classList.add('dark-mode');
    toggleDarkMode.setAttribute('src', './images/icon-sun.svg');
  };

  toggleDarkMode.addEventListener('click', () => {
    let theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      disableDarkMode();
    } else {
      localStorage.setItem('theme', 'dark');
      enableDarkMode();
    }
  });

  let id = 0;
  const addTodo = (todo) => {
    return {
      type: 'ADD_TODO',
      payload: {
        id: id++,
        todo,
      },
    };
  };

  const toggleTodo = (id) => {
    return {
      type: 'TOGGLE_TODO',
      payload: id,
    };
  };

  const filterAll = () => {
    return {
      type: 'FILTER_ALL',
    };
  };

  const filterActive = () => {
    return {
      type: 'FILTER_ACTIVE',
    };
  };

  const filterCompleted = () => {
    return {
      type: 'FILTER_COMPLETED',
    };
  };

  const clearCompleted = () => {
    return {
      type: 'CLEAR_COMPLETED',
    };
  };

  const reducer = (state = { todos: [], filter: 'all' }, action) => {
    switch (action.type) {
      case 'ADD_TODO':
        return {
          ...state,
          todos: [
            ...state.todos,
            {
              id: action.payload.id,
              todo: action.payload.todo,
              completed: false,
            },
          ],
        };
      case 'TOGGLE_TODO':
        return {
          ...state,
          todos: state.todos.map((todo) => {
            if (todo.id == action.payload) {
              return { ...todo, completed: !todo.completed };
            }
            return todo;
          }),
        };
      case 'FILTER_ALL':
        return {
          ...state,
          filter: 'all',
        };
      case 'FILTER_ACTIVE':
        return {
          ...state,
          filter: 'active',
        };
      case 'FILTER_COMPLETED':
        return {
          ...state,
          filter: 'completed',
        };
      case 'CLEAR_COMPLETED':
        return {
          ...state,
          todos: state.todos.filter((todo) => !todo.completed),
        };
      default:
        return state;
    }
  };

  const createStore = (reducer) => {
    const store = {};
    const initialState = reducer(undefined, {});
    store.state = initialState;
    store.listeners = [];
    store.getState = () => store.state;
    store.subscribe = (listener) => {
      store.listeners.push(listener);
    };
    store.dispatch = (action) => {
      store.state = reducer(store.state, action);
      store.listeners.forEach((listener) => listener());
    };
    return store;
  };

  const store = createStore(reducer);

  const getTodos = () => {
    return store.getState().todos;
  };

  const getFilter = () => {
    return store.getState().filter;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    store.dispatch(addTodo(input.value));
    input.value = '';
  });

  clearCompletedElement.addEventListener('click', () => {
    store.dispatch(clearCompleted());
  });

  const render = () => {
    const filterElements = document.querySelectorAll('.filter');
    const parent = document.querySelector('.parent-filter');
    filterElements.forEach((element) => {
      if (element.classList.contains(getFilter())) {
        element.classList.add('selected-filter');
      } else {
        element.classList.remove('selected-filter');
      }
      const newElement = element.cloneNode(true);
      newElement.addEventListener('click', () => {
        if (element.innerText === 'All') {
          store.dispatch(filterAll());
        } else if (element.innerText === 'Active') {
          store.dispatch(filterActive());
        } else {
          store.dispatch(filterCompleted());
        }
      });
      parent.replaceChild(newElement, element);
    });
    const todos = getTodos();
    let string = '';
    let activeTodos = 0;
    const selectedFilter = getFilter();
    todos.forEach((todo) => {
      if (!todo.completed) {
        activeTodos++;
      }
      if (selectedFilter === 'all') {
        string += `
        <li id=${todo.id} class="todo card-item ${
          todo.completed ? 'completed-todo' : ''
        }">
          <div class="icon">
            <div class=${todo.completed ? 'completed' : ''}>
              <img style="display: ${
                todo.completed ? 'block' : 'none'
              }" src="images/icon-check.svg"/>
            </div>
          </div>
          ${todo.todo}
        </li>
        `;
      } else if (selectedFilter === 'active') {
        if (!todo.completed) {
          string += `
        <li id=${todo.id} class="todo card-item ${
            todo.completed ? 'completed-todo' : ''
          }">
          <div class="icon">
            <div></div>
          </div>
          ${todo.todo}
        </li>
        `;
        }
      } else {
        if (todo.completed) {
          string += `
        <li id=${todo.id} class="todo card-item ${
            todo.completed ? 'completed-todo' : ''
          }">
          <div class="icon">
            <div></div>
          </div>
          ${todo.todo}
        </li>
        `;
        }
      }
    });
    todosElement.innerHTML = string;
    const todosUI = document.querySelectorAll('.todo');
    itemsLeft.innerHTML =
      activeTodos === 1
        ? activeTodos + ' Item Left'
        : activeTodos + ' Items Left';
    const handleClick = (e) => {
      store.dispatch(toggleTodo(e.target.id));
    };
    todosUI.forEach((todo) => {
      const newElement = todo.cloneNode(true);
      newElement.addEventListener('click', handleClick);
      todosElement.replaceChild(newElement, todo);
    });
  };

  store.subscribe(render);
});
