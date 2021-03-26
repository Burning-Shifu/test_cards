document.addEventListener('DOMContentLoaded', () => {

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

  
  async function getResource(url) {  
    let res = await fetch(url);
  
    if (!res.ok) {
      throw new Error(`Couldn't fetch ${url}, status ${res.status}`);
    }
  
    return await res.json();
  }
  

  function cards() {
    class OrderCard {
      constructor(id, createDate, order, type, ...classes) {
        this.id = id;
        this.createDate = createDate;
        this.order = order;
        this.type = type;
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
          </div>
        `;

        this.parent.append(element);
      }
    }

    getResource('http://localhost:3000/cards')
        .then(data => {
          data.forEach(({id, createDate, order, type}) => {    // деструктуризируем объект
            new OrderCard(id, createDate, order, type).render();
          });
        });
  }

  cards();

});