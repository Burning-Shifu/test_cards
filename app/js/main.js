'use strict'

document.addEventListener('DOMContentLoaded', () => {

  const sortSelect = document.querySelector('#sort'),
        btnModal = document.querySelector('.sort__add'),
        btnClose = document.querySelector('.modal__close'),
        addModal = document.querySelector('.modal'),
        body = document.querySelector('body'),
        form = document.querySelector('.form'),
        inputId = document.querySelector("#filter-id"),
        inputOrder = document.querySelector("#filter-num"),
        inputFromDate = document.querySelector('#filter-from-date'),
        inputByDate = document.querySelector('#filter-by-date'),
        inputType = document.querySelector('#filter-type');
  let scrollWidth = window.innerWidth - document.documentElement.clientWidth;

  // проверка в LS на сортировку

  switch (localStorage.getItem('sorting')) {
    case 'id-up':
        sortSelect.value = 'id-up';
        cards('id-up');
        break;
    case 'id-down':
        sortSelect.value = 'id-down';
        cards('id-down');
        break;
    case 'date-up':
        sortSelect.value = 'date-up';
        cards('date-up');
        break;
    case 'date-down':
        sortSelect.value = 'date-down';
        cards('date-down');
        break;
    case 'type-up':
        sortSelect.value = 'type-up';
        cards('type-up');
        break;
    case 'type-down':
        sortSelect.value = 'type-down';
        cards('type-down');
        break;
    default:
        sortSelect.value = 'default';
        cards('start');
        break;
  }

  // блок фильтрации

  /** Промис - ожидание прогрузки элемента (для динамичных карточек)
   * Wait for an element before resolving a promise
   * @param {String} querySelector - Selector of element to wait for
   * @param {Integer} timeout - Milliseconds to wait before timing out, or 0 for no timeout              
  */

  function waitForElement(querySelector, timeout = 0) {
    const startTime = new Date().getTime();
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        if (document.querySelector(querySelector)) {
          clearInterval(timer);
          resolve();
        } else if (timeout && now - startTime >= timeout) {
          clearInterval(timer);
          reject();
        }
      }, 100);
    });
  }

  waitForElement('.cards__item', 3000).then(function() {
    const cardsList = document.querySelectorAll('.cards__item');

    // по id
    function filterById(param) {
      cardsList.forEach((card) => {
        let id = card.querySelector(".cards__id");

        if (id.textContent !== param && param !== "") {
          card.style.display = "none";
        } else {
          card.style.display = "";
        }
      });
    }

    // по номеру order

    function filterByOrder(param) {
      cardsList.forEach((card) => {
        let order = card.querySelector(".cards__order");

        if (order.textContent !== param && param !== "") {
          card.style.display = "none";
        } else {
          card.style.display = "";
        }
      });
    }

    // по времени "с" и "по"

    function filterByTime(params) {

      cardsList.forEach((card) => {
        let time = card.querySelector(".cards__time");

        if (params.paramFrom !== "" || params.paramBy !== "") {       // если С или ПО не пустые                          

          if (params.paramFrom === "") {                              // если С пустое   

            if (time.textContent < params.paramBy) {
              card.style.display = "";
            } else {
              card.style.display = "none";
            }

          } else if (params.paramBy === "") {                         // если ПО пустое  

            if (time.textContent > params.paramFrom) {
              card.style.display = "";
            } else {
              card.style.display = "none";
            }

          } else if (time.textContent >= params.paramFrom && time.textContent <= params.paramBy) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        
        } else {
          card.style.display = "";
        }

      });
    }

    //  по типу type

    function filterByType(param) {
      cardsList.forEach((card) => {
        let type = card.querySelector(".cards__type");

        if (type.textContent === param) {
          card.style.display = ""; 
        } else if (param === "all") {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }

      });
    }


    // обработчики событий фильтрации

    inputId.addEventListener('input', () => filterById(inputId.value));
    inputOrder.addEventListener('input', () => filterByOrder(inputOrder.value));
    inputType.addEventListener('change', () => filterByType(inputType.value));

    inputFromDate.addEventListener('input', () => {
      filterByTime({"paramFrom": inputFromDate.value, "paramBy": inputByDate.value});
    });
    inputByDate.addEventListener('input', () => {
      filterByTime({"paramFrom": inputFromDate.value, "paramBy": inputByDate.value});
    });
  });

  // end блок фильтрации

  // модальное окно
      
  function openModal(modal) {
    modal.classList.remove('hide');
    modal.classList.add('show');
    body.style.overflow = 'hidden';
    body.style.paddingRight = scrollWidth + 'px';
  }
  
  function closeModal(modal) {
    modal.classList.remove('show');
    modal.classList.add('hide');
    body.style.overflow = 'auto';
    body.style.paddingRight = 0 + 'px';
  }

  btnModal.addEventListener('click', () => openModal(addModal));

  btnClose.addEventListener('click', () => closeModal(addModal));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && addModal.classList.contains('show')) {
      closeModal(addModal);
    }
  });

  // submit

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    form.reset();
  });

  // end модальные окна

  // блок get карточек и сортировки

  async function getResource(url) {  
    let res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Couldn't fetch ${url}, status ${res.status}`);
    }

    return await res.json();
  }

  // вывод карточек из бд

  function cards(val) {
    class OrderCard {
      constructor(id, createDate, order, type, time, ...classes) {
        this.id = id;
        this.createDate = createDate;
        this.order = order;
        this.type = type;
        this.time = time;
        this.classes = classes; 
        this.parent = document.querySelector(".cards");
      }
    
      render() {
        const element = document.createElement('article');
    
        // устанавливаем дефолтное значение класса
        if (this.classes.length === 0) {
          element.classList.add('cards__item');
        } else {
          this.classes.forEach(className => element.classList.add(className));
        }
    
        element.innerHTML = `
          <div class="cards__header d-flex">
            <h3 class="cards__title">Карточка <span class="cards__order">${this.order}</span></h3>
            <div class="cards__btns d-flex">
              <button class="cards__drag" type="button"></button>
              <div class="cards__extra">
                <button class="cards__extra-btn" type="button">
                  <span class="cards__extra-dot"></span>
                </button>
                <div class="cards__extra-menu">
                  <ul class="cards__extra-list">
                    <li class="cards__extra-item">
                      <button class="cards__extra-menu-btn" type="button">
                        <span class="cards__extra-pic cards__extra-pic--pen"></span>
                        Редактировать
                      </button>
                    </li>
                    <li class="cards__extra-item">
                      <button class="cards__extra-menu-btn" type="button">
                        <span class="cards__extra-pic cards__extra-pic--cross"></span>
                        Удалить
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="cards__content">
            <p class="cards__id">${this.id}</p>
            <p class="cards__create-date">${this.createDate}</p>
            <p class="cards__time">${this.time}</p>
            <p class="cards__type">${this.type}</p>
            </div>
        `;

        this.parent.append(element);
      }
    }

    getResource('http://localhost:3000/cards').then(data => {
      switch (val) {
          case 'id-up':
              data = data.sort(compare_id_up);
              localStorage.setItem('sorting', 'id-up');
              break;
          case 'id-down':
              data = (data.sort(compare_id_up)).reverse();
              localStorage.setItem('sorting', 'id-down');
              break;
          case 'date-up':
              data = data.sort(compare_date_up);
              localStorage.setItem('sorting', 'date-up');
              break;
          case 'date-down':
              data = (data.sort(compare_date_up)).reverse();
              localStorage.setItem('sorting', 'date-down');
              break;
          case 'type-up':
              data = data.sort(compare_type_up);
              localStorage.setItem('sorting', 'type-up');
              break;
          case 'type-down':
              data = (data.sort(compare_type_up)).reverse();
              localStorage.setItem('sorting', 'type-down');
              break;
          default:
              data = data;
              break;
      }

      data.forEach(({id, createDate, order, type, time}) => {
        new OrderCard(id, createDate, order, type, time).render();
      });
    })
  }

  function compare_id_up( a, b ) {
    if ( a.id < b.id ){
      return -1;
    }
    if ( a.id > b.id ){
      return 1;
    }
    return 0;
  }

  function compare_date_up( a, b ) {
    if ( Date.parse(a.createDate) < Date.parse(b.createDate) ){
      return -1;
    }
    if ( Date.parse(a.createDate) > Date.parse(b.createDate) ){
      return 1;
    }
    return 0;
  }

  function compare_type_up( a, b ) {
    if ( a.type < b.type ){
      return -1;
    }
    if ( a.type > b.type ){
      return 1;
    }
    return 0;
  }

  // обработчик события сортировки (селект)

  sortSelect.addEventListener('change', (elem) => {
    document.querySelector('.cards').innerHTML = '';
    cards(elem.target.value);
  });

  // end блок вывода карточек и сортировки

  // блок добавления карточек

  const postData = async (url, data) => {  
    let res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: data
    });

    return await res.json(); 
  };

  function addForm() {
    const form = document.querySelector('#add-form');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    const message = {
      loading: 'Загружаем...',
      success: 'Карточка добавлена',
      failure: 'Что-то пошло не так :('
    };

    bindPostData();

    function bindPostData() {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        let statusMsg = document.createElement('div'); //создаем эл-т для вывода статуса
        statusMsg.classList.add('msg');
        statusMsg.textContent = message.loading;     
        form.insertAdjacentElement('beforeend', statusMsg);

        const formData = new FormData(form);

        const json = JSON.stringify(Object.fromEntries(formData.entries()));
        
        postData('http://localhost:3000/cards', json)
        .then(() => {
          statusMsg.textContent = message.success;
          document.querySelector('.cards').innerHTML = ''; 
          cards('start');
          setTimeout(() => closeModal(addModal), 3000);
          setTimeout(() => statusMsg.remove(), 3000);
        }).catch(() => {
          statusMsg.textContent = message.failure; 
        }).finally(() => {
          form.reset();
        });
      });
    }
  }

  addForm();

  // end блок добавления карточек

  // кнопки на карточках

  waitForElement('.cards__item', 3000).then(function() {
    const cardsList = document.querySelectorAll('.cards__item'),
          // cardExtraBtn = document.querySelectorAll('.cards__extra-btn'),
          cardExtra = document.querySelectorAll('.cards__extra'),
          cardExtraMenu = document.querySelectorAll('.cards__extra-menu');

    cardExtra.forEach((item) => {
      let cardExtraBtn = item.querySelector('.cards__extra-btn'),
          cardExtraMenu = item.querySelector('.cards__extra-menu');

        cardExtraBtn.addEventListener('click', () => {
          if (cardExtraMenu.classList.contains('show')) {
            cardExtraMenu.classList.remove('show');
          } else {
            cardExtraMenu.classList.add('show');
          }
      });
    });
  });

});