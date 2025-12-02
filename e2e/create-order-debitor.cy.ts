// #5000 Заказ на дебитора физ.лицо и перс.цены [ok]
// #4999 Заказ на дебитора юр.лицо и перс.цены [ok]

describe('Кейсы c промо', () => {
  beforeEach(() => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.login();
  });



  // https://allure.itlabs.io/project/28/test-cases/5000?treeId=58
  it('#5000 Заказ на дебитора физ.лицо и перс.цены', () => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.createAppeal({ auth: { value: '9000000055', type: 'phone' } });
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    cy.contains('div', 'Укажите магазин').find('input[type=search]').click();
    cy.get('.ant-select-item-option').first().click({ force: true });
    cy.get('[data-test=search-input]').type('575180');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=shopping-card-button]').first().click();
    // в модалке изменили количество товара, объявили quantity
    const quantity = 1;
    // фиксируем промо цену в модалке до сохранения
    cy.get('[data-test=product-info-price]')
      .invoke('text')
      .then((text) =>
        cy
          .wrap(parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.')))
          .as('price'),
      );
    // фиксируем баллы в модалке до сохранения
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
    // в инпут кол-ва, дождались когда будет 1, очистили и ввели quantity
    cy.get('input[data-test=add-quantity-input]')
      .wait(1000)
      .first()
      .then(($input) => {
        cy.wrap($input).invoke('val').should('eq', '1');
        cy.wrap($input).clear().type(`${quantity}`);
      });
    //фиксируем цену в модалке товара в разделе "стоимость"
    // умножаем price на quantity
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
    //добавляем и переходим в корзину
    cy.contains('button', 'Добавить').click();
    cy.get('[data-test=to-cart-button]').click();
    cy.url().should('include', '/cart');
    // меняем тип клиента
    cy.get('[data-test=client-type-input]').click().clear().type('94822');
    cy.get('[title="Дюкова И.Н."]').click();
    //смотрим стоимость товаров в корзине ДО сохранения
    cy.get('[data-test=cart-position-cost]')
      .invoke('text')
      .then((text) => {
        const cost = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@cost').should('eq', cost);
      });
    //смотрим сколько баллов в корзине ДО сохранения
    cy.get('[data-test=cart-position-bonus]')
      .invoke('text')
      .then((text) => {
        const bonus = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@totalBonus').should('eq', bonus);
      });

    //смотрим стоимость товаров в общем чеке ДО сохранения
    cy.get('[data-test=cart-total-cost]')
      .invoke('text')
      .then((text) => {
        const cost = parseFloat(text.replace(/[^\d.]/g, ''));
        cy.get('@cost').should('eq', cost);
      });

    //смотрим общее количеств бонусов  в чеке ДО создания заказа
    cy.get('[data-test=cart-total-bonus]')
      .invoke('text')
      .then((text) => {
        const bonus = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@totalBonus').should('eq', bonus);
      });
    //создали заказ
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
    // сравниваем цену на товары в корзине после ПОВТОРНОГО сохранения
    cy.get('[data-test=cart-position-cost]')
      .invoke('text')
      .then((text) => {
        const cost = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@cost').should('eq', cost);
      });
    // сравниваем баллы за товары в корзине после ПОВТОРНОГО сохранения
    cy.get('[data-test=cart-position-bonus]')
      .invoke('text')
      .then((text) => {
        const bonus = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@totalBonus').should('eq', bonus);
      });
    cy.get('[data-test="delete-all-position"]').click();
    cy.contains('.ant-modal', 'Удалить все позиции?')
      .contains('button', 'OK')
      .click();
    cy.get('[data-test="save-order"], [data-test="save-offer"]').click();
  });

  // https://allure.itlabs.io/project/28/test-cases/4999?treeId=58
  it('#4999 Заказ на дебитора юр.лицо и перс.цены', () => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.createAppeal({ auth: { value: '9000000055', type: 'phone' } });
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    cy.contains('div', 'Укажите магазин').find('input[type=search]').click();
    cy.get('.ant-select-item-option').first().click({ force: true });
    cy.get('[data-test=search-input]').type('575180');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=shopping-card-button]').first().click();
    // в модалке изменили количество товара, объявили quantity
    const quantity = 1;
    // фиксируем промо цену в модалке до сохранения
    cy.get('[data-test=product-info-price]')
      .invoke('text')
      .then((text) =>
        cy
          .wrap(parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.')))
          .as('price'),
      );
    // фиксируем баллы в модалке до сохранения
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
    // в инпут кол-ва, дождались когда будет 1, очистили и ввели quantity
    cy.get('input[data-test=add-quantity-input]')
      .wait(1000)
      .first()
      .then(($input) => {
        cy.wrap($input).invoke('val').should('eq', '1');
        cy.wrap($input).clear().type(`${quantity}`);
      });
    //фиксируем цену в модалке товара в разделе "стоимость"
    // умножаем price на quantity
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
    //добавляем и переходим в корзину
    cy.contains('button', 'Добавить').click();
    cy.get('[data-test=to-cart-button]').click();
    cy.url().should('include', '/cart');
    // меняем тип клиента
    cy.get('[data-test=client-type-input]').click().clear().type('213370');
    //смотрим стоимость товаров в корзине ДО сохранения
    cy.get('[data-test=cart-position-cost]')
      .invoke('text')
      .then((text) => {
        const cost = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@cost').should('eq', cost);
      });
    //смотрим сколько баллов в корзине ДО сохранения
    cy.get('[data-test=cart-position-bonus]')
      .invoke('text')
      .then((text) => {
        const bonus = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@totalBonus').should('eq', bonus);
      });

    //смотрим стоимость товаров в общем чеке ДО сохранения
    cy.get('[data-test=cart-total-cost]')
      .invoke('text')
      .then((text) => {
        const cost = parseFloat(text.replace(/[^\d.]/g, ''));
        cy.get('@cost').should('eq', cost);
      });

    //смотрим общее количеств бонусов  в чеке ДО создания заказа
    cy.get('[data-test=cart-total-bonus]')
      .invoke('text')
      .then((text) => {
        const bonus = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@totalBonus').should('eq', bonus);
      });
    //создали заказ
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
    // сравниваем цену на товары в корзине после ПОВТОРНОГО сохранения
    cy.get('[data-test=cart-position-cost]')
      .invoke('text')
      .then((text) => {
        const cost = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@cost').should('eq', cost);
      });
    // сравниваем баллы за товары в корзине после ПОВТОРНОГО сохранения
    cy.get('[data-test=cart-position-bonus]')
      .invoke('text')
      .then((text) => {
        const bonus = parseFloat(
          text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
        );
        cy.get('@totalBonus').should('eq', bonus);
      });
    cy.get('[data-test="delete-all-position"]').click();
    cy.contains('.ant-modal', 'Удалить все позиции?')
      .contains('button', 'OK')
      .click();
    cy.get('[data-test="save-order"], [data-test="save-offer"]').click();
  });
});
