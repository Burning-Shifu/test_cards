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

  
  async function getResource(url) {  
    let res = await fetch(url);
  
    if (!res.ok) {
      throw new Error(`Couldn't fetch ${url}, status ${res.status}`);
    }
  
    return await res.json();
  }
  
  // вывод карточек из бд

  function cards() {
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
            <h3 class="cards__title">Card <span class="cards__num">${this.order}</span></h3>
            <button class="cards__extra" type="button">
              <span class="cards__extra-dot"></span>
            </button>
          </div>
          <div class="cards__content">
            <p class="cards__id">${this.id}</p>
            <p class="cards__create-date">${this.createDate}</p>
            <p class="cards__create-date">${this.time}</p>
            <p class="cards__create-date">${this.type}</p>
            </div>
        `;

        this.parent.append(element);
      }
    }

    getResource('http://localhost:3000/cards')
        .then(data => {
          data.forEach(({id, createDate, order, type, time}) => {    // деструктуризируем объект
            new OrderCard(id, createDate, order, type, time).render();
          });
        });
  }

  cards();

  // end вывод карточек из бд

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


  const cardsList = document.querySelectorAll(".cards__item");

  const cardsId = document.querySelectorAll(".cards__id"),
        inputId = document.querySelector("#filter-id");

  function filterById(param) {
    
    cardsId.forEach((item) => {
      console.log('ok');
      if (item.textContent !== param && param !== "") {
        item.parentElement.parentElement.style.display = "none";
      } else {
        item.parentElement.parentElement.style.display = "";
      }
    });
    console.log(param);
  }

  inputId.addEventListener('input', () => filterById(inputId.value));

  

  

});