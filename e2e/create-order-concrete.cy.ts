describe('Создание заказа', () => {
  beforeEach(() => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.login();
    cy.createAppeal();
  });

  // https://allure.itlabs.io/project/28/test-cases/6240?treeId=58
  it('#6240 создание стандартного заказа для товара, который имеет признак ГТР', () => {
    //поиск товара, добавление через быстрое добавление в корзину, переход в корзину
    cy.addPositionToCart({
      text: '14904',
      quantity: 1,
      afterAddPositionGoToCart: true,
    });
    cy.url().should('include', '/cart');
    //создать заказ
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
    cy.get('[data-test=send-sms]').click();
    cy.get('[data-test=pattern-sms]').click();
    cy.contains('div', 'Заказ. Номер сумма, адрес самовывоза').click({
      force: true,
    });
    cy.contains(
      'Можно забрать на 50 лет Октября, д. 109 / 4. QR для получения',
    ).should('exist');
    cy.get('[data-test=send-sms-for]').click();
    cy.get('[data-test=delete-all-position]').click();
    cy.contains('.ant-modal', 'Удалить все позиции?')
      .contains('button', 'OK')
      .click();
    cy.get('[data-test=save-order], [data-test=save-offer]').click();
  });

  //https://allure.itlabs.io/project/28/test-cases/4141?treeId=58
  it('#4141Создать заказ на бетон через быстрое добавление в корзину', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('бетон');
    //нажать "найти"
    cy.get('[data-test=search-button]').click();
    //нажать кнопку быстрого добавления товара в корзину
    cy.get('[data-test=shopping-card-button]').first().click();
    //в поле количество, ввести объём бетона
    cy.wait(3000);
    cy.get('[data-test=add-quantity-input]').type('10');
    //выберите адрес
    cy.get('[data-test=delivery-address]').type('Агеева');
    cy.contains('div', 'улица Агеева').click();
    //выберите дату доставки
    cy.get('input[placeholder*="Выберите дату"]').click();
    //определяем текущую дату и добавляем к ней 1 день
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    const tomorrowFormatted = `${year}-${month}-${day}`;
    cy.get(`td[title="${tomorrowFormatted}"]`).click();

    //нажать добавить машину
    cy.wait(3000);
    cy.get('[data-test=add-car-concrete]').click();
    //выбрать тип
    cy.contains('div', 'Выберите тип').click();
    cy.contains('div', 'Бетоновоз 13м3').click();
    //выбрать время
    cy.contains('div', 'Выберите время')
      .find('input[type=search]')
      .click()
      .wait(3000);

    cy.get(`[data-test=cars-time-0]`)
      .find('.ant-select-item-option-content')
      .first()
      .click();

    //ввести объём бетона
    cy.get('input[placeholder*="Объём"]').type('10');
    //ввести любой текст в поле "комментарий"
    cy.get('input[placeholder*="Комментарий"]').type('тест');
    cy.get('.ant-btn-primary').contains('Добавить').click();
    //перейти в корзину
    cy.get('[data-test=to-cart-button]').click();
    // Нажимаем создать заказ
    cy.get('[data-test="make-order"]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
  });

  //https://allure.itlabs.io/project/28/test-cases/4251?treeId=58
  it('#4251 Создать заказ бетона с несколькими машинами', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('бетон');
    //нажать "найти"
    cy.get('[data-test=search-button]').click();
    //нажать кнопку быстрого добавления товара в корзину
    cy.get('[data-test=shopping-card-button]').first().click();
    //в поле количество, ввести объём бетона
    cy.wait(3000);
    cy.get('[data-test=add-quantity-input]').type('20');
    //выберите адрес
    cy.get('[data-test=delivery-address]').type('Агеева');
    cy.contains('div', 'улица Агеева').click();
    //выберите дату доставки
    cy.get('input[placeholder*="Выберите дату"]').click();
    //определяем текущую дату и добавляем к ней 1 день
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    const tomorrowFormatted = `${year}-${month}-${day}`;
    cy.get(`td[title="${tomorrowFormatted}"]`).click();
    //Нажать кнопку "нужен автобетононасос"
    cy.contains('div', 'Нужен автобетононасос')
      .parent()
      .find('button[role=switch]')
      .then(($switch) => {
        if ($switch.attr('aria-checked') === 'false') {
          cy.wrap($switch).click();
        }
        //выбрать длинну насоса
        cy.get('[data-test=length-of-pump]').wait(3000).click;

        cy.contains('div', 'АБН до 28м').click();
        //выбрать интервал подачи насоса
        cy.get(`[data-test=interval-of-pump]`).wait(3000).click();

        cy.get(`[data-test=interval-of-pump]`)
          .find('.ant-select-item-option')
          .first()
          .click();
        //нажать добавить машину
        cy.wait(3000);
        cy.get('[data-test=add-car-concrete]').click();
        //выбрать тип
        cy.contains('div', 'Выберите тип').click();
        cy.contains('div', 'Бетоновоз 13м3').click();
        //выбрать время
        cy.contains('div', 'Выберите время')
          .find('input[type=search]')
          .click()
          .wait(3000);

        cy.get(`[data-test=cars-time-0]`)
          .find('.ant-select-item-option-content')
          .first()
          .click();
        //ввести объём бетона
        cy.get('input[data-test=volume-car-0]').first().type('10');
        //нажать добавить машину (вторую)
        cy.wait(3000);
        cy.get('[data-test=add-car-concrete]').click();
        //выбрать тип
        cy.contains('div', 'Выберите тип').click();
        cy.contains('div', 'Бетоновоз 10м3').click();
        //выбрать время
        cy.contains('div', 'Выберите время')
          .find('input[type=search]')
          .click()
          .wait(3000);

        cy.get(`[data-test=cars-time-0]`)
          .find('.ant-select-item-option-content')
          .first()
          .click();
        //ввести объём бетона
        cy.get('input[data-test=volume-car-0]').first().clear().type('10');
        //добавить оставшийся бетон в машину
        cy.get('.ant-btn-primary').contains('Добавить').click().wait(3000);
        //очистить поле магазин
        cy.get('.ant-select-selection-item-remove').click();
        //выбрать первый магазин
        cy.contains('div', 'Укажите магазин').click();
        cy.get('.ant-select-item-option').first().click({ force: true });
        //скрыть нулевые остатки
        cy.get('.ant-select-item-option').first().click({ force: true });
        cy.contains('div', 'Скрыть нулевые остатки')
          .parent()
          .find('button[role=switch]')
          .then(($switch) => {
            if ($switch.attr('aria-checked') === 'false') {
              cy.wrap($switch).click();
            }
          });
        cy.get(`[data-test=search-input]`).clear().type('краска');
        //нажать "найти"
        cy.get('[data-test=search-button]').click().wait(3000);
        //нажать кнопку быстрого добавления товара в корзину
        cy.get('[data-test=shopping-card-button]').first().click();
        cy.contains('С бетоном нельзя добавить другие товары').should('exist');
        cy.contains('span', 'Закрыть').click();
        //перейти в корзину
        cy.get('[data-test=to-cart-button]').click();
        // Нажимаем создать заказ
        cy.get('[data-test="make-order"]').click();
        cy.contains('Заказ успешно создан').should('exist');
        cy.contains('Заказ №').should('exist');
      });
  });

  //allure.itlabs.io/project/28/test-cases/4345?treeId=58
  it('#4345 Создать заказ с дробным числом', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('бетон');
    //нажать "найти"
    cy.get('[data-test=search-button]').click();
    //нажать кнопку быстрого добавления товара в корзину
    cy.get('[data-test=shopping-card-button]').first().click();
    //в поле количество, ввести объём бетона
    cy.wait(3000);
    cy.get('[data-test=add-quantity-input]').type('10.5');
    //выберите адрес
    cy.get('[data-test=delivery-address]').type('Агеева');
    cy.contains('div', 'улица Агеева').click();
    //выберите дату доставки
    cy.get('input[placeholder*="Выберите дату"]').click();
    //определяем текущую дату и добавляем к ней 1 день
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    const tomorrowFormatted = `${year}-${month}-${day}`;
    cy.get(`td[title="${tomorrowFormatted}"]`).click();

    //нажать добавить машину
    cy.wait(3000);
    cy.get('[data-test=add-car-concrete]').click();
    //выбрать тип
    cy.get('[data-test=cars-type]').click();
    cy.contains('div', 'Бетоновоз 12м3').click();
    //выбрать время
    cy.contains('div', 'Выберите время')
      .find('input[type=search]')
      .click()
      .wait(3000);

    cy.get(`[data-test=cars-time-0]`)
      .find('.ant-select-item-option-content')
      .first()
      .click();
    //ввести объём бетона
    cy.get('[data-test=volume-car-0]').clear().wait(4000).type('10.5');
    //добавить  бетон в машину
    cy.get('.ant-btn-primary').contains('Добавить').click().wait(3000);
    //перейти в корзину
    cy.get('[data-test=to-cart-button]').click();
    // Нажимаем создать заказ
    cy.get('[data-test="make-order"]').click();
    //удалить товары
    cy.get('[data-test=delete-all-position]').click();
    cy.contains('.ant-modal', 'Удалить все позиции?')
      .contains('button', 'OK')
      .click();
    cy.get('[data-test=save-order], [data-test=save-offer]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
  });

  //allure.itlabs.io/project/28/test-cases/4346?treeId=58
  it('#4346 Создать заказ с комментарием к ТТН', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('бетон');
    //нажать "найти"
    cy.get('[data-test=search-button]').click();
    //нажать кнопку быстрого добавления товара в корзину
    cy.get('[data-test=shopping-card-button]').first().click();
    //в поле количество, ввести объём бетона
    cy.wait(3000);
    cy.get('[data-test=add-quantity-input]').type('10');
    //выберите адрес
    cy.get('[data-test=delivery-address]').type('Агеева');
    cy.contains('div', 'улица Агеева').click();
    //выберите дату доставки
    cy.get('input[placeholder*="Выберите дату"]').click();
    //определяем текущую дату и добавляем к ней 1 день
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    const tomorrowFormatted = `${year}-${month}-${day}`;
    cy.get(`td[title="${tomorrowFormatted}"]`).click();
    //нажать добавить машину
    cy.wait(3000);
    cy.get('[data-test=add-car-concrete]').click();
    //выбрать тип
    cy.get('[data-test=cars-type]').click();
    cy.contains('div', 'Бетоновоз 10м3').click();
    //выбрать время
    cy.contains('div', 'Выберите время').find('input[type=search]').click();

    cy.get(`[data-test=cars-time-0]`)
      .find('.ant-select-item-option-content')
      .first()
      .click();
    //ввести объём бетона
    cy.get('[data-test=volume-car-0]').clear().type('10');
    //ввести любой текст в комментарий к ТТН
    cy.get('[data-test=comment-car]').click().type('тест');
    //добавить  бетон в машину
    cy.get('.ant-btn-primary').contains('Добавить').click().wait(3000);
    //перейти в корзину
    cy.get('[data-test=to-cart-button]').click();
    // Нажимаем создать заказ
    cy.get('[data-test="make-order"]').click();
    cy.get('[data-test=save-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
    //скопировать номер заказа

    cy.get('[class^="_order-number_"]')
      .invoke('text')
      .then((orderNumberText) => {
        const orderNumber = orderNumberText.split('Заказ №')[1];

        cy.get('[data-icon="close-circle"]').click();
        cy.contains('OK').click().wait(2000);
        //вставить номер заказа
        cy.get('[data-test="search-input-number-order"]').type(orderNumber);
        cy.contains('div', 'Найти').click().wait(2000);
        //открыть модальное окно бетона
        cy.get('[class^="_productName_"]').click();
        //проверить поле "комментарий"
        cy.get('[data-test=comment-car]').type('тест').should('exist');
        cy.get('.ant-btn-primary').contains('Сохранить').click().wait(3000);
        //удалить товары
        cy.get('[data-test=delete-all-position]').click();
        cy.contains('.ant-modal', 'Удалить все позиции?')
          .contains('button', 'OK')
          .click();
      });
  });

  //https:allure.itlabs.io/project/28/test-cases/4130?treeId=58
  it('#4130 Создать заказ бетона с через карточку товара с ручной ценой', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    //выбрать любой магазин
    cy.contains('div', 'Укажите магазин').click();
    cy.get('.ant-select-item-option').first().click({ force: true });
    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('бетон');
    //нажать "найти"
    cy.get('[data-test=search-button]').click();
    //нажать кнопку быстрого добавления товара в корзину
    cy.get('[data-test=product-link]').first().click();
    //ввести количество бетона в инпут
    cy.wait(6000);
    cy.get('input[data-test="add-quantity-input"]').clear().type('5');
    //добавить
    cy.contains('span', 'Добавить').click().wait(3000);
    //при открытии модального окна-значение 8 должно сохраниться
    cy.get('input[data-test="add-quantity-input"]')
      .first() //  выбираем первый элемент
      .should('be.visible')
      .clear({ force: true })
      .type('5', { force: true });

    //изменить цену
    cy.get('input[data-test="input-price-modal-0"]').clear().type('8149');
    //выберите адрес
    cy.get('[data-test=delivery-address]').type('Агеева');
    cy.contains('div', 'улица Агеева').click();
    //выберите дату доставки
    cy.get('input[placeholder*="Выберите дату"]').click();
    //определяем текущую дату и добавляем к ней 1 день
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    const tomorrowFormatted = `${year}-${month}-${day}`;
    cy.get(`td[title="${tomorrowFormatted}"]`).click();
    //Нажать кнопку "нужен автобетононасос"
    cy.contains('div', 'Нужен автобетононасос')
      .parent()
      .find('button[role=switch]')
      .then(($switch) => {
        if ($switch.attr('aria-checked') === 'false') {
          cy.wrap($switch).click();
        }
        //выбрать длину насоса
        cy.get('[data-test=length-of-pump]').wait(3000).click;
        cy.contains('div', 'АБН до 28м').click();
        //выбрать интервал подачи насоса
        cy.get(`[data-test=interval-of-pump]`).wait(3000).click();
        cy.get(`[data-test=interval-of-pump]`)
          .find('.ant-select-item-option')
          .first()
          .click();

        //нажать добавить машину
        cy.wait(3000);
        cy.get('[data-test=add-car-concrete]').click();
        //выбрать тип
        cy.contains('div', 'Выберите тип').click();
        cy.contains('div', 'Бетоновоз 9м3').click();
        //выбрать время
        cy.contains('div', 'Выберите время')
          .find('input[type=search]')
          .click()
          .wait(3000);

        cy.get(`[data-test=cars-time-0]`)
          .find('.ant-select-item-option-content')
          .first()
          .click();
        //ввести объём бетона
        cy.get('input[data-test=volume-car-0]').first().type('5');
        //добавить  бетон в заказ
        cy.get('.ant-modal-footer')
          .contains('button', 'Добавить')
          .should('be.visible')
          .click();
        //перейти в корзину
        cy.get('[data-test=to-cart-button]').click();
        //создать заказ
        cy.get('[data-test="make-order"]').click();
        cy.contains('Заказ успешно создан').should('exist');
        cy.contains('Заказ №').should('exist');
      });
  });

  //https://allure.itlabs.io/project/28/test-cases/4232?treeId=58
  it('#4232 Создать заказ бетона с изменением объема через листинг', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    //выбрать любой магазин
    cy.contains('div', 'Укажите магазин').click();
    cy.get('.ant-select-item-option').first().click({ force: true });
    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('бетон');
    cy.get('[data-test=search-button]').click();
    //нажать кнопку быстрого добавления товара в корзину
    cy.get('[data-test=shopping-card-button]').first().click();
    //в поле количество, ввести объём бетона
    cy.wait(3000);
    cy.get('[data-test=add-quantity-input]').type('6');
    //выберите адрес
    cy.get('[data-test=delivery-address]').type('Агеева');
    cy.contains('div', 'улица Агеева').click();
    //выберите дату доставки
    cy.get('input[placeholder*="Выберите дату"]').click();
    //определяем текущую дату и добавляем к ней 1 день
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    const tomorrowFormatted = `${year}-${month}-${day}`;
    cy.get(`td[title="${tomorrowFormatted}"]`).click();
    //нажать добавить машину
    cy.wait(3000);
    cy.get('[data-test=add-car-concrete]').click();
    //выбрать тип
    cy.get('[data-test=cars-type]').click();
    cy.contains('div', 'Бетоновоз 6м3').click();
    //выбрать время
    cy.contains('div', 'Выберите время').find('input[type=search]').click();

    cy.get(`[data-test=cars-time-0]`)
      .find('.ant-select-item-option-content')
      .first()
      .click();
    //ввести объём бетона
    cy.get('[data-test=volume-car-0]').clear().type('6');
    //добавить  бетон в машину
    cy.get('.ant-btn-primary').contains('Добавить').click().wait(3000);
    //перейти в корзину
    cy.get('[data-test=to-cart-button]').click();

    cy.get('[data-test=cart-position]').click();
    cy.get('[data-test=add-quantity-input]').clear().type('10');
    //выбрать тип
    cy.get('[data-test=cars-type]').click();
    cy.contains('div', 'Бетоновоз 10м3').click();
    //выбрать время
    cy.contains('div', 'Выберите время').find('input[type=search]').click();
    cy.get(`[data-test=cars-time-0]`)
      .find('.ant-select-item-option-content')
      .first()
      .click();
    //ввести объём бетона
    cy.get('[data-test=volume-car-0]').clear().type('10');
    cy.get('.ant-btn-primary').contains('Сохранить').click();
    //создать заказ
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
    cy.contains('10 м3. х').should('exist');
  });

  //https://allure.itlabs.io/project/28/test-cases/4245?treeId=58
  it('#4245 Создать заказ бетона с изменением цены через листинг', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    //выбрать любой магазин
    cy.contains('div', 'Укажите магазин').click();
    cy.get('.ant-select-item-option').first().click({ force: true });
    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('бетон');
    //нажать "найти"
    cy.get('[data-test=search-button]').click();
    //нажать кнопку быстрого добавления товара в корзину
    cy.get('[data-test=shopping-card-button]').first().click();
    //в поле количество, ввести объём бетона
    cy.wait(3000);
    cy.get('[data-test=add-quantity-input]').type('5');
    cy.get('[data-test=input-price-modal-0]').clear().type('8000');
    //выберите адрес
    cy.get('[data-test=delivery-address]').type('Агеева');
    cy.contains('div', 'улица Агеева').click();
    //выберите дату доставки
    cy.get('input[placeholder*="Выберите дату"]').click();
    //определяем текущую дату и добавляем к ней 1 день
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    const tomorrowFormatted = `${year}-${month}-${day}`;
    cy.get(`td[title="${tomorrowFormatted}"]`).click();
    //нажать добавить машину
    cy.wait(3000);
    cy.get('[data-test=add-car-concrete]').click();
    //выбрать тип
    cy.get('[data-test=cars-type]').click();
    cy.contains('div', 'Бетоновоз 6м3').click();
    //выбрать время
    cy.contains('div', 'Выберите время').find('input[type=search]').click();
    cy.get(`[data-test=cars-time-0]`)
      .find('.ant-select-item-option-content')
      .first()
      .click();
    //ввести объём бетона
    cy.get('[data-test=volume-car-0]').clear().type('5');
    //добавить  бетон в машину
    cy.get('.ant-btn-primary').contains('Добавить').click().wait(3000);
    //перейти в корзину
    cy.get('[data-test=to-cart-button]').click();
    //создать заказ
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
    cy.contains('8 000 ₽').should('exist');
  });

  //https://allure.itlabs.io/project/28/test-cases/4018?treeId=58
  it('#4018 Создать заказ с бетоном через причину обращения "консультация"', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Консультация Материалы / Услуги').click({ force: true });
    //выбрать любой магазин
    cy.contains('div', 'Укажите магазин').click();
    cy.get('.ant-select-item-option').first().click({ force: true });
    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('бетон');
    cy.get('[data-test=search-button]').click();
    //нажать кнопку быстрого добавления товара в корзину
    cy.get('[data-test=shopping-card-button]').first().click();
    //в поле количество, ввести объём бетона
    cy.wait(3000);
    cy.get('[data-test=add-quantity-input]').type('5');
    //выберите адрес
    cy.get('[data-test=delivery-address]').type('Агеева');
    cy.contains('div', 'улица Агеева').click();
    //выберите дату доставки
    cy.get('input[placeholder*="Выберите дату"]').click();
    //определяем текущую дату и добавляем к ней 1 день
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    const tomorrowFormatted = `${year}-${month}-${day}`;
    cy.get(`td[title="${tomorrowFormatted}"]`).click();
    //нажать добавить машину
    cy.wait(3000);
    cy.get('[data-test=add-car-concrete]').click();
    //выбрать тип
    cy.get('[data-test=cars-type]').click();
    cy.contains('div', 'Бетоновоз 6м3').click();
    //выбрать время
    cy.contains('div', 'Выберите время').find('input[type=search]').click();
    cy.get(`[data-test=cars-time-0]`)
      .find('.ant-select-item-option-content')
      .first()
      .click();
    //ввести объём бетона
    cy.get('[data-test=volume-car-0]').clear().type('5');
    //добавить  бетон в машину
    cy.get('.ant-btn-primary').contains('Добавить').click().wait(3000);
    //перейти в корзину
    cy.get('[data-test=to-cart-button]').click();
    //создать заказ
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
  });
});
