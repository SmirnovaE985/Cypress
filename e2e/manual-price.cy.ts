// #5376 Создание заказа с ручной ценой и товаром без ручной цены [ok]
// #5362 Баллы ПЛ не начисляются при изменении ручной цены [ok]
// #5368 Если до создания заказа использовать ручную цену, но вернуть обратно продажную цену, баллы ПЛ будут начислены [ok]
// #5374 Нельзя применять промокод на ручные цены [ok]

describe('Кейсы с ручной ценой', () => {
  beforeEach(() => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.login();
  });

  // https://allure.itlabs.io/project/28/test-cases/5376?treeId=58
  it('#5376 Создание заказа с ручной ценой и товаром без ручной цены', () => {
    cy.createAppeal();

    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    cy
      .get('.ant-select-selection-overflow-item')
      ?.first()
      ?.click({ force: true });
    cy.get('.ant-select-item-option-content').first().click({ force: true });
    cy.get('[data-test=remain-switch]').then(($switch) => {
      if ($switch.attr('aria-checked') === 'false') {
        cy.wrap($switch).click();
      }
    });
    cy.get('[data-test=search-input]').type('кисть');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=shopping-card-button]')?.first()?.click();

    cy.get('[data-test=price-imkc-modal-0]')
      .invoke('text')
      .then((text) => {
        const imkcVal = +text.match(/\d[\d\s]*/)[0].replace(/\s/g, '');

        cy.wait(1000);
        cy.get('[data-test=input-price-modal-0]')?.first()?.clear()?.type('12');

        cy.wrap(imkcVal).should('be.gt', 12);

        cy.get('.ant-btn-primary')
          .contains('Добавить')
          .should('not.be.disabled');
        cy.get('.ant-btn-primary').contains('Добавить').click();
      });
    cy.get('[data-test=to-cart-button]').click();
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
    cy.contains('В поиск').click();

    cy.get('[data-test=search-input]').clear().type('ведро');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=shopping-card-button]')?.first()?.click();
    cy.get('.ant-btn-primary').contains('Добавить').click();
    cy.get('[data-test=to-cart-button]').click();
    cy.get('[data-test=save-order]').click();
    cy.contains('Успешно сохранено').should('exist');
    cy.get('[data-test=cart-position-cost]')
      .last()
      .invoke('text')
      .then((text) => {
        const manualPrice = +text.match(/\d[\d\s]*/)[0].replace(/\s/g, '');

        cy.wrap(manualPrice).should('equal', 12);
      });
  });

  // https://allure.itlabs.io/project/28/test-cases/5362?treeId=58
  it('#5362 Баллы ПЛ не начисляются при изменении ручной цены', () => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.createAppeal({ auth: { value: '9000000055', type: 'phone' } });

    cy.openPositionCard('краска');
    cy.get('[data-test=product-card-input-price]').clear().type('12');
    cy.contains('Добавить').click({ force: true });
    cy.get('[data-test=to-cart-button]').click();
    cy.get('[data-test=cart-total-bonus]').invoke('text').should('equal', '0');
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.get('[data-test=cart-total-bonus]').invoke('text').should('equal', '0');
    cy.get('[data-test=save-order]').click();
    cy.contains('Успешно сохранено').should('exist');
    cy.get('[data-test=cart-total-bonus]').invoke('text').should('equal', '0');
  });

  // https://allure.itlabs.io/project/28/test-cases/5368?treeId=58
  it('#5368 Применение ручной цены ДО СОЗДАНИЯ заказа, с начислением баллов ПЛ', () => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.createAppeal();

    cy.addPositionToCart({ text: 'цемент' });
    cy.get('[data-test=to-cart-button]').click();
    cy.get('[data-test=cart-total-bonus]')
      .invoke('text')
      .then((initBonus) => {
        cy.wrap(initBonus).should('not.be.a', '0');

        cy.get('[class^="_position_"]').first().click();
        cy.wait(1000);
        cy.get('[data-test=modal-edit-stop-price]')
          .invoke('text')
          .then((stopPriceVal) => {
            const valueTransform = +stopPriceVal
              .match(/\d[\d\s]*/)[0]
              .replace(/\s/g, '');

            cy.get('[data-test=modal-edit-input-price]')
              .clear()
              .type(`${valueTransform}`)
              .type(`${valueTransform === 0 ? 1 : '{del}'}`);

            cy.contains('Сохранить').click();

            cy.get('span[data-test="cart-total-bonus"]')
              .should(($span) => {
                expect($span.text()).not.to.eq(initBonus);
              })
              .invoke('text')
              .then((bonusAfterText) => {
                cy.wrap(bonusAfterText).should('eq', '0');
              });

            cy.get('[class^="_position_"]').first().click();
            cy.get('[data-test=price-imkc-edit-modal]').click();
            cy.contains('Сохранить').click();

            cy.get('span[data-test="cart-total-bonus"]').should(($span) => {
              expect($span.text()).eq(initBonus);
            });

            cy.get('[data-test=make-order]').click();
            cy.contains('Заказ успешно создан').should('exist');

            cy.get('span[data-test="cart-total-bonus"]').should(($span) => {
              expect($span.text()).eq(initBonus);
            });
          });
      });
  });

  // https://allure.itlabs.io/project/28/test-cases/5374?treeId=58
  it('#5374 Нельзя применять промокод на ручные цены', () => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.createAppeal({ auth: { value: '9000000055', type: 'phone' } });

    cy.addPositionToCart({
      text: '2777',
      quantity: 10,
      afterAddPositionGoToCart: true,
    });
    cy.get('[class^="_position_"]').first().click();
    cy.wait(1000);
    cy.get('[data-test=modal-edit-input-price]').type('9');
    cy.contains('span', 'Сохранить').click();
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
    cy.get('[data-test=promocode-block-title]').click();
    cy.get('input[name=promocode]').first().type('CALLCENTER1');
    cy.get('[data-test=confirm-sms-code]').click();.click();
    cy.contains(
      'Позиции для применения промокода CALLCENTER1 отсутствуют',
    ).should('exist');
  });
});
