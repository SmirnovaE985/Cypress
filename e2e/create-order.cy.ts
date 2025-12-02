describe('Создание заказа', () => {
  beforeEach(() => {
    cy.intercept('/search-analytics-api/**', { data: 'success ' });
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.login();
    cy.createAppeal();
  });

  afterEach(() => {
    cy.get('[data-test=delete-all-position]').click();
    cy.contains('.ant-modal', 'Удалить все позиции?')
      .contains('button', 'OK')
      .click();
    cy.get('[data-test=save-order], [data-test=save-offer]').click();
  });

  // https://allure.itlabs.io/project/28/test-cases/4423?treeId=58
  it('#4423 Создание предложения с доставкой', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();

    cy.contains('div', 'Укажите магазин').find('input[type=search]').click();
    cy.get('.ant-select-item-option').first().click({ force: true });
    cy.contains('div', 'Скрыть нулевые остатки')
      .parent()
      .find('button[role=switch]')
      .then(($switch) => {
        if ($switch.attr('aria-checked') === 'false') {
          cy.wrap($switch).click();
        }
      });
    cy.get('[data-test=search-input]').type('молоток');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=shopping-card-button]').first().click();
    cy.contains('button', 'Добавить').click();
    cy.get('[data-test=to-cart-button]').click();

    cy.get('[data-test=make-offer]').click();
    cy.contains('Предложение успешно создано').should('exist');
    cy.contains('Предложение №').should('exist');

    cy.get('[data-test=cart-to-delivery-link]').click();
    cy.url().should('include', '/cart/delivery');
    cy.contains('Автовыбор транспорта')
      .parent()
      .find('button[role=switch]')
      .then(($switch) => {
        if ($switch.attr('aria-checked') === 'true') {
          cy.wrap($switch).click();
        }
      });
    cy.contains('Тоннажность автомобиля')
      .parent()
      .find('.ant-radio-button-wrapper')
      .next()
      .last()
      .click();
    cy.get('[data-test=delivery-address]').type('Тюмень');
    cy.get('div[class^="_suggest-container"]').children().first().click();
    cy.contains('Выберите дату').click();
    cy.get('div[class^="_container"] > div[class^="_datepicker"]').within(
      () => {
        cy.get('div[class^="_month-changer"]').last().click();
        cy.get('div[data-test=available-day]').first().click();
      },
    );
    cy.get('[class^="_valuepicker-body"]')
      .find('[class^="_value_"]')
      .first()
      .click();
    cy.get('[data-test=delivery-ttn-save]').click();
    cy.contains('Доставка успешно сохранена!').should('exist');
    cy.get('[data-test=link-back]').click();
    cy.get('[data-test=offer-to-order]').click();
    cy.contains('Предложение переведено в заказ успешно!').should('exist');
    cy.contains('Заказ №').should('exist');
    cy.contains('Доставки').should('exist');
  });

  // https://allure.itlabs.io/project/28/test-cases/3607?treeId=58
  it('#3607 Создание заказа через карточку товара', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    cy.contains('div', 'Укажите магазин').find('input[type=search]').click();
    cy.get('.ant-select-item-option').first().click({ force: true });
    cy.contains('div', 'Скрыть нулевые остатки')
      .parent()
      .find('button[role=switch]')
      .then(($switch) => {
        if ($switch.attr('aria-checked') === 'false') {
          cy.wrap($switch).click();
        }
      });
    cy.get('[data-test=search-input]').type('молоток');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=product-link]').first().click();

    cy.contains('span', 'доступно')
      .invoke('text')
      .should('not.eq', 'доступно 0')
      .then((text) => {
        cy.get('[data-test="add-quantity-input"]').clear().type('1');
      });
    cy.contains('button', 'Добавить').click();
    cy.get('[data-test=to-cart-button]').click();
    cy.url().should('include', '/cart');
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
  });

  // https://allure.itlabs.io/project/28/test-cases/4584?treeId=58
  it('#4584 Создание заказа с нескольких магазинов', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    cy.contains('div', 'Укажите магазин').find('input[type=search]').click();
    cy.get('.ant-select-item-option').each(($option, index) => {
      if (index === 2) return false;
      cy.wrap($option).click({ force: true });
    });
    cy.contains('div', 'Скрыть нулевые остатки')
      .parent()
      .find('button[role=switch]')
      .then(($switch) => {
        if ($switch.attr('aria-checked') === 'false') {
          cy.wrap($switch).click();
        }
      });
    cy.get('[data-test=search-input]').type('гвозди');
    cy.get('[data-test=search-button]').click();

    cy.get('[data-test=shopping-card-button]').first().click();
    cy.get('input[data-test=add-quantity-input]')
      .wait(1000)
      .each(($input) => {
        cy.wrap($input).invoke('val').should('be.oneOf', ['0', '']);
        cy.wrap($input).clear().type('1');
      });
    cy.contains('button', 'Добавить').click();

    cy.get('[data-test=to-cart-button]').click();
    cy.url().should('include', '/cart');
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
  });

  // https://allure.itlabs.io/project/28/test-cases/4875?treeId=58
  it('#4875 При создании заказа, где товара несколько штук, корректно считается итог(Мастер)', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    cy.contains('div', 'Укажите магазин').find('input[type=search]').click();
    cy.get('.ant-select-item-option').first().click({ force: true });
    cy.contains('div', 'Скрыть нулевые остатки')
      .parent()
      .find('button[role=switch]')
      .then(($switch) => {
        if ($switch.attr('aria-checked') === 'false') {
          cy.wrap($switch).click();
        }
      });
    cy.get('[data-test=search-input]').type('саморез');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=shopping-card-button]').first().click();

    const quantity = 4;
    cy.get('[data-test=product-info-price]')
      .invoke('text')
      .then((text) =>
        cy
          .wrap(parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.')))
          .as('price'),
      );
    cy.get('[data-test=product-info-bonus]')
      .invoke('text')
      .then((text) =>
        cy
          .wrap(
            parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.')) *
              quantity,
          )
          .as('totalBonus'),
      );
    cy.get('input[data-test=add-quantity-input]')
      .wait(1000)
      .first()
      .then(($input) => {
        cy.wrap($input).invoke('val').should('eq', '1');
        cy.wrap($input).clear().type(`${quantity}`);
      });
    cy.get('[data-test=modal-position-cost]')
      .invoke('text')
      .then((text) => {
        const cost = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@price').then((price) => {
          cy.wrap(cost)
            .as('cost')
            .should('eq', +price * quantity);
        });
      });

    cy.contains('button', 'Добавить').click();
    cy.get('[data-test=to-cart-button]').click();
    cy.url().should('include', '/cart');
    cy.get('[data-test=cart-position-cost]')
      .invoke('text')
      .then((text) => {
        const cost = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@cost').should('eq', cost);
      });
    cy.get('[data-test=cart-position-bonus]')
      .invoke('text')
      .then((text) => {
        const bonus = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@totalBonus').should('eq', bonus);
      });
    cy.get('[data-test=cart-total-cost]')
      .invoke('text')
      .then((text) => {
        const cost = parseFloat(text.replace(/[^\d.]/g, ''));
        cy.get('@cost').should('eq', cost);
      });
    cy.get('[data-test=cart-total-bonus]')
      .invoke('text')
      .then((text) => {
        const bonus = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@totalBonus').should('eq', bonus);
      });

    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
    //проверяем стоимость и количество бонусов
    cy.get('[data-test=cart-position-cost]')
      .invoke('text')
      .then((text) => {
        const cost = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@cost').should('eq', cost);
      });
    cy.get('[data-test=cart-position-bonus]')
      .invoke('text')
      .then((text) => {
        const bonus = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@totalBonus').should('eq', bonus);
      });
    cy.get('[data-test=cart-total-cost]')
      .invoke('text')
      .then((text) => {
        const cost = parseFloat(text.replace(/[^\d.]/g, ''));
        cy.get('@cost').should('eq', cost);
      });
    cy.get('[data-test=cart-total-bonus]')
      .invoke('text')
      .then((text) => {
        const bonus = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@totalBonus').should('eq', bonus);
      });
  });

  //https://allure.itlabs.io/project/28/test-cases/4608?treeId=58
  it('#4608 Создание заказа с отрезным материалом с БМ или МОК', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    cy.get('[data-test="sale-orgs"]').click();
    cy.contains('div', 'СД Тюмень').click({ force: true });
    //выбрать любой БМ или МОК
    cy.contains('div', 'Укажите магазин').click();
    cy.get('.ant-select-item-option')
      .contains('БМ Тмн, Мельникайте, 123')
      .click({ force: true });
    cy.contains('div', 'Скрыть нулевые остатки')
      .parent()
      .find('button[role=switch]')
      .then(($switch) => {
        if ($switch.attr('aria-checked') === 'false') {
          cy.wrap($switch).click();
        }
      });
    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('геотекстиль');
    //нажать "найти"
    cy.get('[data-test=search-button]').click();
    //нажать кнопку перехода к карточке товара
    cy.get('[data-test=product-link]').first().click();
    // Нажимаем 'Добавить'
    cy.get('[data-test=add-position-to-cart]').click();
    // Переходим в корзину
    cy.get('[data-test="to-cart-button"]').click();
    // Нажимаем создать заказ
    cy.get('[data-test="make-order"]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
  });

  //https://allure.itlabs.io/project/28/test-cases/6290?treeId=58
  it('#6290 Создание заказа с отрезным материалом с РЦ ', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    cy.get('[data-test="sale-orgs"]').click();
    cy.contains('div', 'СД Тюмень').click({ force: true });
    //выбрать РЦ
    cy.contains('div', 'Укажите магазин').click();
    cy.contains('div', 'РЦ Тмн, 50 лет Октября, 109 ко').click({ force: true });
    cy.contains('div', 'Скрыть нулевые остатки')
      .parent()
      .find('button[role=switch]')
      .then(($switch) => {
        if ($switch.attr('aria-checked') === 'false') {
          cy.wrap($switch).click();
        }
      });
    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('87745');

    //нажать "найти"
    cy.get('[data-test=search-button]').click();
    //нажать кнопку перехода к карточке товара
    cy.get('[data-test=product-link]').first().click();
    // меняем ЕИ на пм
    cy.get('[data-test="modal-edit-units"]').click();
    cy.contains('div', 'пм.').click();
    // Нажимаем 'Добавить'
    cy.get('[data-test=add-position-to-cart]').click();
    // Переходим в корзину
    cy.get('[data-test="to-cart-button"]').click();
    // Нажимаем создать заказ
    cy.get('[data-test="make-order"]').click();
    cy.contains('Произошла ошибка, заказ не сохранен.').should('exist');
    cy.get('[data-test="cart-position"]').click();
    // меняем ЕИ на бух
    cy.get('[data-test="modal-edit-units"]').click();
    cy.contains('div', '1бух. = 50м.').click();
    cy.contains('div', 'Сохранить').click();
    cy.get('[data-test="make-order"]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
  });

  // https:allure.itlabs.io/project/28/test-cases/5929?treeId=58
  it('#5929 создание заказа с колеровкой, другим товаром и доставкой', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    // выбрать  магазин
    cy.contains('div', 'Укажите магазин').click();
    cy.contains('div', 'РЦ Тмн, 50 лет Октября, 109 ко').click({ force: true });
    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('55866');
    //нажать "найти"
    cy.get('[data-test=search-button]').click();
    //нажать кнопку перехода к карточке товара
    cy.get('[data-test=product-link]').first().click();
    // Нажимаем 'Добавить'
    cy.get('[data-test=add-position-to-cart]').click();
    // Переходим в корзину
    cy.get('[data-test="to-cart-button"]').click();
    // Нажимаем создать заказ
    cy.get('[data-test="make-order"]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
    cy.get('[data-icon="format-painter"]').click();
    //в строку поиска ввести название колеровки
    cy.get('input[placeholder*="Код"]').type('TVT Y356');

    cy.get('[data-test="colors-item"]').first().click();
    cy.contains('span', 'Сохранить').click();
    cy.get('[data-test=btn-go-in-search]').click();
    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('ведро');
    //нажать "найти"
    cy.get('[data-test=search-button]').click();
    //нажать кнопку перехода к карточке товара
    cy.get('[data-test=product-link]').first().click();
    // Нажимаем 'Добавить'
    cy.get('[data-test=add-position-to-cart]').click();
    cy.get('[data-test="to-cart-button"]').click();
    //оформить доставку
    cy.get('[data-test=cart-to-delivery-link]').click();
    cy.get('[data-test=delivery-address]').type('Ямская 31');
    cy.get('[class^="_bottom-line_"]').first().click();
    cy.get('.ant-switch').first().click();
    cy.contains('span', '0,5 тент').click();
    cy.get('[class^="_next-button_"]').first().click();
    cy.contains('div', 'Выберите дату').click();
    cy.get('div[class^="_container"] > div[class^="_datepicker"]').within(
      () => {
        cy.get('div[class^="_month-changer"]').last().click();
        cy.get('div[data-test=available-day]').last().click();
      },
    );
    cy.get('[class^="_valuepicker-body"]')
      .find('[class^="_value_"]')
      .first()
      .click();
    cy.get('[data-test=delivery-ttn-save]').click();
    cy.contains('Доставка успешно сохранена!', { timeout: 60000 }).should(
      'exist',
    );
    cy.get('[data-test=link-back]').click();
    cy.wait(5000);
    cy.get('[data-test=save-order]').click();
    //колеровка добавлена, доставка сохранена, заказ создан
    cy.contains('Изменение цвета краски (колеровка) TVT Y356').should('exist');
    cy.contains('Новая').should('exist');
    cy.contains('Заказ №').should('exist');
  });

  //https://allure.itlabs.io/project/28/test-cases/5927?treeId=58
  it('#5927 создание и изменение в заказе с несколькими колеровками', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    cy.contains('div', 'Укажите магазин').click();
    cy.contains('div', 'РЦ Тмн, 50 лет Октября, 109 ко').click({ force: true });
    cy.contains('div', 'Скрыть нулевые остатки')
      .parent()
      .find('button[role=switch]')
      .then(($switch) => {
        if ($switch.attr('aria-checked') === 'false') {
          cy.wrap($switch).click();
        }
      });
    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('55869');
    //нажать "найти"
    cy.get('[data-test=search-button]').click();
    //нажать кнопку перехода к карточке товара
    cy.get('[data-test=product-link]').click();
    // Нажимаем 'Добавить'
    cy.contains('div', 'Добавить').click();
    cy.contains('span', 'Назад').click({ force: true });
    cy.get('[data-test="search-input"]').clear().type('55866');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=product-link]').click();
    cy.get('[data-test=add-position-to-cart]').click();
    // Переходим в корзину
    cy.get('[data-test="to-cart-button"]').click();
    // Нажимаем создать заказ
    cy.get('[data-test="make-order"]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
    //выбрать колеровку у первой  краски
    cy.get('[data-icon="format-painter"]').first().click();
    //в строку поиска ввести название колеровки
    cy.get('input[placeholder*="Код"]').type('TVT Y356');
    cy.get('[data-test="colors-item"]').first().click();
    cy.contains('span', 'Сохранить').click();
    //выбрать вторую колеровку (находим элементы с классом _position_ )
    cy.get('[class^="_position_"]')
      .eq(1)
      .find('[data-icon="format-painter"]')
      .click();
    cy.get('input[placeholder*="Код"]').type('ACC 0N.00.90');
    cy.get('[data-test="colors-item"]').first().click();
    cy.contains('span', 'Сохранить').click();
    //нажать на первую колеровку и изменить цвет
    cy.get('[data-icon="format-painter"]').first().click();
    //в строку поиска ввести название колеровки
    cy.get('input[placeholder*="Код"]').type('TVT K441');
    cy.get('[data-test="colors-item"]').first().click();
    cy.contains('span', 'Сохранить').click().wait(2000);
    cy.contains('Изменение цвета краски (колеровка) ACC 0N.00.90').should(
      'exist',
    );
    cy.contains('Изменение цвета краски (колеровка) TVT K441').should('exist');
    cy.contains('Заказ №').should('exist');
  });
});
