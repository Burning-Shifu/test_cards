'use strict'

document.addEventListener('DOMContentLoaded', () => {

  // const postData = async (url, data) => {  
  //   let res = await fetch(url, {
  //     method: 'POST',
  //     headers: {
  //       'Content-type': 'application/json'
  //     },
  //     body: data
  //   });
  
  //   return await res.json(); 
  // };

  
  

  cards('start');

  
  // end вывод карточек из бд

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

  waitForElement(".cards__item", 3000).then(function() {
    const cardsList = document.querySelectorAll('.cards__item'),
          inputId = document.querySelector("#filter-id"),
          inputOrder = document.querySelector("#filter-num"),
          inputFromDate = document.querySelector('#filter-from-date'),
          inputByDate = document.querySelector('#filter-by-date'),
          inputType = document.querySelector('#filter-type');

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

  // модальные окна
  const btnModal = document.querySelector('.sort__add'),
    btnClose = document.querySelector('.modal__close'),
    addModal = document.querySelector('.modal'),
    body = document.querySelector('body'),
    form = document.querySelector('.book-modal__form');

  let scrollWidth = window.innerWidth - document.documentElement.clientWidth;
      

  function openModal(modal) {
    modal.classList.remove('hide');
    modal.classList.add('show');
    body.style.overflow = 'hidden';
    body.style.paddingRight = scrollWidth + 'px';
  }

  btnModal.addEventListener('click', () => openModal(addModal));

  function closeModal(modal) {
    modal.classList.remove('show');
    modal.classList.add('hide');
    body.style.overflow = 'auto';
    body.style.paddingRight = 0 + 'px';
  }

  btnClose.addEventListener('click', () => closeModal(addModal));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && addModal.classList.contains('show')) {
      closeModal(addModal);
    }
  });

  // submit

  // form.addEventListener('submit', (e) => {
  //   e.preventDefault();

  //   form.reset();
  //   closeModal(modalBook);
  //   openModal(modalThx);
  // });

  // end модальные окна

});


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
      this.classes = classes;  // важно помнить, что это массив, даже если он пустой
      this.parent = document.querySelector(".cards");
    }
  
    render() {
      const element = document.createElement('article');
  
      // устанавливаем дефолтное значение класса
      if (this.classes.length === 0) {
        element.classList.add('cards__item');
      } else {
        this.classes.forEach(className => element.classList.add(className)); // добавляем диву все классы из массива
      }
  
      element.innerHTML = `
        <div class="cards__header d-flex">
          <h3 class="cards__title">Карточка <span class="cards__order">${this.order}</span></h3>
          <button class="cards__extra" type="button">
            <span class="cards__extra-dot"></span>
          </button>
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
            break;
        case 'id-down':
            data = (data.sort(compare_id_up)).reverse();
            break;
        case 'date-up':
            data = data.sort(compare_date_up);
            break;
        case 'date-down':
            data = (data.sort(compare_date_up)).reverse();
            break;
        case 'type-up':
            data = data.sort(compare_type_up);
            break;
        case 'type-down':
            data = (data.sort(compare_type_up)).reverse();
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

document.querySelector('#sort').addEventListener('change', (elem) => {
  document.getElementsByClassName('cards d-flex')[0].innerHTML = ''; 
  cards(elem.target.value);
});

//