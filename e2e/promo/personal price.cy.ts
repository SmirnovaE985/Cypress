// #5006 Изменение перс цены на отмененной позиции [ok]
// #5160 Применение и отмена промокода, в заказе с перс.ценой [ok]
// #4868 Создание заказа с доставкой и перс.ценой [ok]http://localhost:3000/__/#/runs
// #5100 Создание заказа с ЗАЗой и перс.ценой при изменении кол-ва товара в корзине [ok]
// #5008 Изменение ЕИ для товара с перс ценой [ok]
// #4919 При открытии заказа в редактировании-перс цена отображается корректно [ok]
// #4874 Изменении количества товара после создания заказа и отправка СМС [ok]

import { AddPositionToCartResult } from '../../support/commands';

describe('Кейсы c промо', () => {
  beforeEach(() => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.login();
  });

  //https://allure.itlabs.io/project/28/test-cases/5006?treeId=58
  it('#5006 Изменение перс цены на отмененной позиции', () => {
    cy.createAppeal({ auth: { value: '9000000055', type: 'phone' } });
    cy.addPositionToCart({ text: '2777', afterAddPositionGoToCart: true }).then(
      (position) => {
        cy.wrap(position).as('position');
        cy.wrap(position.cost).as('cost');
        cy.wrap(position.quantity).as('quantity');
        cy.wrap(position.price).as('price');
        cy.wrap(position.bonus).as('bonus');
      },
    );
    //перешли в корзину и зафиксировали значения
    cy.get<AddPositionToCartResult>('@position').then((position) =>
      cy.checkPromoIntoCart({
        totalCost: position.cost,
        totalBonus: position.bonus,
        isOrderCreated: false,
      }),
    );
    // удалили позицию из заказа
    cy.get('[data-test=delete-position]').click();
    cy.get('[data-test=order-canceled-checkbox]').click();
    // проверить что товар отменен, перс цены нет
    cy.get('[data-test=cart-position-cost]').should('not.exist');
    //проверяем, что бонусы к позиции не применены
    cy.get('[data-test=cart-position-bonus]').should('not.exist');
    //вернули позицию в заказ
    cy.get('[data-test=return-position]').click();
    cy.get<AddPositionToCartResult>('@position').then((position) =>
      cy.checkPromoIntoCart({
        totalCost: position.cost,
        totalBonus: position.bonus,
        isOrderCreated: true,
      }),
    );
    cy.get('[data-test=delete-all-position]').click();
    cy.wait(2000);
    cy.contains('span', 'OK').click();
    cy.get('[data-test=save-order]').click();
  });

  //https://allure.itlabs.io/project/28/test-cases/5160?treeId=58
  it('#5160 Применение и отмена промокода, в заказе с перс.ценой', () => {
    cy.createAppeal({ auth: { value: '9000000055', type: 'phone' } });
    cy.addPositionToCart({
      text: '54435',
      afterAddPositionGoToCart: true,
    }).then((position) => {
      cy.wrap(position).as('position');
      cy.wrap(position.cost).as('cost');
      cy.wrap(position.quantity).as('quantity');
      cy.wrap(position.price).as('price');
      cy.wrap(position.bonus).as('bonus');
    });
    cy.get<AddPositionToCartResult>('@position').then((position) =>
      cy.checkPromoIntoCart({
        totalCost: position.cost,
        totalBonus: position.bonus,
        isOrderCreated: false,
      }),
    );
    cy.get('[data-test=promocode-block-title]').click();
    cy.get('input[name=promocode]').first().type('CALLCENTER1');
    cy.get('[data-test=promocode-apply]').click();
    cy.contains('Перс. цена').should('exist');
    cy.get('[class^="_striked_"]').then((res) => {
      expect(res.length).to.eq(1);
    });
    cy.get('[data-test=promocode-cancel]').click();
    cy.contains('Применение промокода отменено').should('exist');
    cy.get('[data-test=save-order]').click();
    cy.get<AddPositionToCartResult>('@position').then((position) =>
      cy.checkPromoIntoCart({
        totalCost: position.cost,
        totalBonus: position.bonus,
        isOrderCreated: true,
      }),
    );

    cy.get('[data-test=delete-all-position]').click();
    cy.wait(2000);
    cy.contains('span', 'OK').click();
    cy.get('[data-test=save-order]').click();
  });

  //https://allure.itlabs.io/project/28/test-cases/4868?treeId=58
  it('#4868 Создание заказа с доставкой и перс.ценой', () => {
    cy.createAppeal({ auth: { value: '9000000055', type: 'phone' } });
    cy.addPositionToCart({
      text: '2777',
      afterAddPositionGoToCart: true,
    });
    cy.get('[data-test=make-order]').click();
    cy.contains('Перс. цена').should('exist');
    // //оформить доставку
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
    cy.contains('Перс. цена').should('exist');
    cy.get('[data-test=delete-all-position]').click();
    cy.wait(2000);
    cy.contains('span', 'OK').click();
    cy.get('[data-test=save-order]').click();
  });

  //https://allure.itlabs.io/project/28/test-cases/5100?treeId=58
  it('#5100 Создание заказа с ЗАЗой и перс.ценой при изменении кол-ва товара в корзине', () => {
    cy.createAppeal({ auth: { value: '9000000055', type: 'phone' } });
    cy.openPositionCard('2777');
    cy.get('[data-test=ZAZA]').click();
    //выбрать завод-получатель
    cy.get('[data-test=search-input-store]').find('input[type=search]').click();
    cy.contains('1023 БМ Тмн, Клары Цеткин, 2').click({ force: true });
    // Выбираем пункт отгрузки
    cy.get('[data-test="search-input-shipment"]')
      .find('input[type=search]')
      .click();
    cy.get('.zaza-dropdown')
      .find('.ant-select-item-option')
      .contains('Тмн')
      .click();
    cy.get('[data-test=add-position]').click();
    // Переходим в корзину
    cy.get('[data-test="to-cart-button"]').click();
    cy.contains('Перс. цена').should('exist');
    // меняем в модалке , количество товара до создания заказа
    cy.get('[data-test=cart-position]').click();
    cy.get('[data-test=add-quantity-input]').clear().type('3').click();
    cy.get('[data-test=save-btn-in-modal-edit-position]').click();
    //создали заказ
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Перс. цена').should('exist');
    cy.get('[data-test=zaza-Новая]').should('exist');
    cy.get('[data-test=delete-all-position]').click();
    cy.wait(2000);
    cy.contains('span', 'OK').click();
    cy.get('[data-test=save-order]').click();
  });

  //https:allure.itlabs.io/project/28/test-cases/5008?treeId=58
  it('#5008 Изменение ЕИ для товара с перс ценой', () => {
    cy.createAppeal();
    cy.addPositionToCart({
      text: '159840',
      afterAddPositionGoToCart: true,
    });
    cy.get('[data-test=cart-position]').click();
    cy.get('[data-test=modal-edit-units]').click();
    cy.get('[data-test="unit-PAA"]').click();
    // проверяем, что title="пар." применен
    cy.get('span[title="пар."]', { timeout: 10000 }).should('exist');
    //выводим цену в константу и запоминаем
    cy.get('[data-test=modal-edit-input-price]')
      .invoke('val')
      .then((val) => {
        const priceInModal = parseFloat(
          String(val)
            .replace(/[^\d.,]/g, '')
            .replace(/,/g, '.'),
        );
        // Сохраняем в элиас
        cy.wrap(priceInModal).as('priceInModal');
        //сохраняем и возвращаемся в корзину
        cy.get('[data-test=save-btn-in-modal-edit-position]').click();
        // Проверяем cart-total-cost
        cy.get('[data-test=cart-total-cost]')
          .invoke('text')
          .then((text) => {
            const cartTotalCost = parseFloat(
              text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
            );
            expect(cartTotalCost, 'cart total cost').to.eq(priceInModal);
          });
        // Проверяем cart-position-cost
        cy.get('[data-test=cart-position-cost]')
          .invoke('text')
          .then((text) => {
            const cartPositionCost = parseFloat(
              text.replace(/[^\d.,]/g, '').replace(/,/g, '.'),
            );
            expect(cartPositionCost, 'cart-position-cost').to.eq(priceInModal);
          });
        cy.get('[data-test=make-order]').click();
        cy.get('[data-test=delete-all-position]').click();
        cy.wait(2000);
        cy.contains('span', 'OK').click();
        cy.get('[data-test=save-order]').click();
      });
  });

  //https://allure.itlabs.io/project/28/test-cases/4919?treeId=58
  it('#4919 При открытии заказа в редактировании-перс цена отображается корректно', () => {
    cy.createAppeal({ auth: { value: '9000000055', type: 'phone' } });
    cy.addPositionToCart({
      text: '575180',
      afterAddPositionGoToCart: true,
    }).then((position) => {
      cy.wrap(position).as('position');
      cy.wrap(position.cost).as('cost');
      cy.wrap(position.quantity).as('quantity');
      cy.wrap(position.price).as('price');
      cy.wrap(position.bonus).as('bonus');
    });
    cy.get<AddPositionToCartResult>('@position').then((position) =>
      cy.checkPromoIntoCart({
        totalCost: position.cost,
        totalBonus: position.bonus,
        isOrderCreated: false,
      }),
    );
    //скопировать номер заказа и закрыть
    cy.get('[class^="_order-number_"]')
      .invoke('text')
      .then((orderNumberText) => {
        const orderNumber = orderNumberText.split('Заказ №')[1];
        cy.get('[data-icon="close-circle"]').click();
        cy.contains('OK').click().wait(2000);
        //вставить номер заказа
        cy.get('[data-test="search-input-number-order"]').type(orderNumber);
        cy.contains('div', 'Найти').click().wait(2000);
      });
    //
    //   //перешли в корзину и зафиксировали значения
    cy.get<AddPositionToCartResult>('@position').then((position) =>
      cy.checkPromoIntoCart({
        totalCost: position.cost,
        totalBonus: position.bonus,
        isOrderCreated: true,
      }),
    );
  });

  //https://allure.itlabs.io/project/28/test-cases/4874?treeId=58
  it('#4874 Изменении количества товара после создания заказа и отправка СМС', () => {
    cy.createAppeal({ auth: { value: '9000000055', type: 'phone' } });
    cy.addPositionToCart({
      text: '2777',
      afterAddPositionGoToCart: true,
    });
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Перс. цена').should('exist');
    cy.get('[data-test=cart-position]').click();
    cy.get('[data-test=add-quantity-input]').clear().type('2');
    cy.get('[data-test=save-btn-in-modal-edit-position]').click();
    cy.get('[data-test=save-order]').click();
    cy.contains('Успешно сохранено').should('exist');
    //сравниваем цену на товар в корзине и общем чеке
    function checkCartCostsEqualityNumeric() {
      cy.get('[data-test=cart-position-cost]')
        .invoke('text')
        .then((positionCostText) => {
          cy.get('[data-test=cart-total-cost]')
            .invoke('text')
            .then((totalCostText) => {
              const positionCost = parseFloat(
                positionCostText.replace(/[^\d.,]/g, '').replace(',', '.'),
              );
              const totalCost = parseFloat(
                totalCostText.replace(/[^\d.,]/g, '').replace(',', '.'),
              );
              expect(positionCost).to.equal(totalCost);

              cy.log(`Position cost numeric: ${positionCost}`);
              cy.log(`Total cost numeric: ${totalCost}`);
            });
        });
    }
    cy.get('[data-test=send-sms]').click();
    cy.get('[data-test=pattern-sms]').click();
    cy.contains('div', 'Заказ. Номер сумма, адрес самовывоза').click();
    cy.contains('на 1300.00р. Можно забрать на 50 лет Октября, д. 109 ').should(
      'exist',
    );
    cy.get('[data-test=send-sms-for]').click();
    cy.get('[data-test=delete-all-position]').click();
    cy.wait(2000);
    cy.contains('span', 'OK').click();
    cy.get('[data-test=save-order]').click();
    cy.contains('Успешно сохранено').should('exist');
  });
});
