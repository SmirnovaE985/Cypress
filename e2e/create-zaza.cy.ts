describe('Создание ЗаЗы межгород', () => {
  beforeEach(() => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.login();
    cy.createAppeal({ auth: { type: 'phone', value: '9000000055' } });
  });

  afterEach(() => {
    cy.get('[data-test="delete-all-position"]').click();
    cy.contains('.ant-modal', 'Удалить все позиции?')
      .contains('button', 'OK')
      .click();
    cy.get('[data-test="save-order"], [data-test="save-offer"]').click();
  });

  //https:allure.itlabs.io/project/28/test-cases/5411?treeId=58
  it('#5411 Создание ЗаЗы межгород', () => {
    cy.openPositionCard('457843');
    // Нажимаем 'Оформить ЗАЗу'
    cy.get('[data-test=ZAZA]').click();
    // Выбираем магазин
    cy.get('[data-test="search-input-store"]')
      .find('input[type=search]')
      .click();

    // Выбираем пункт отгрузки
    cy.get('[data-test="search-input-shipment"]')
      .find('input[type=search]')
      .click();
    cy.get('.zaza-dropdown')
      .find('.ant-select-item-option')
      .contains('Екб')
      .click();

    // Нажимаем 'Добавить'
    cy.contains('span', 'Добавить').click();
    // Переходим в корзину
    cy.get('[data-test="to-cart-button"]').click();
    // Нажимаем создать заказ
    cy.get('[data-test="make-order"]').click();
    // Проверяем количество созданных ЗАЗ
    cy.get('[data-test="zaza-Новая"]').should('have.length', 1);
  });

  //https://allure.itlabs.io/project/28/test-cases/5652?treeId=58
  it('#5652 Создать ЗаЗу, добавить вторую', () => {
    cy.openPositionCard('75959');
    // Нажимаем 'Оформить ЗАЗу'
    cy.get('[data-test=ZAZA]').click();
    // Выбираем магазин
    cy.get('[data-test="search-input-store"]')
      .find('input[type=search]')
      .click();
    cy.get('.ant-select-item-option').first().click({ force: true });
    // Выбираем пункт отгрузки
    cy.get('[data-test="search-input-shipment"]')
      .find('input[type=search]')
      .click();
    cy.get('.zaza-dropdown')
      .find('.ant-select-item-option')
      .contains('Екб')
      .click();
    // Нажимаем 'Добавить'
    cy.get('button[type="button"]').contains('Добавить').click().wait(3000);
    // Переходим в корзину
    cy.get('[data-test="to-cart-button"]').click();
    // Нажимаем создать заказ
    cy.get('[data-test="make-order"]').click();
    // Нажимаем кнопку 'В поиск'
    cy.contains('В поиск').click();
    // Вводим запрос'
    cy.get('input[data-test="search-input"]').type('159840');
    // Нажимаем 'Найти'
    cy.get('div[data-test="search-button"]').click();
    // Включаем скрыть нулевые остатки
    cy.get('[data-test=remain-switch]').then(($switch) => {
      if ($switch.attr('aria-checked') === 'false') {
        cy.wrap($switch).click();
      }
    });
    // Открываем модалку быстрого добавления у первого товара из списка
    cy.get('[data-test=product-link]')?.first()?.click();
    // Нажимаем 'Оформить ЗАЗу'
    cy.get('[data-test=ZAZA]').click();
    // Выбираем магазин
    cy.get('[data-test="search-input-store"]')
      .find('input[type=search]')
      .click();
    cy.get('.ant-select-item-option').first().click({ force: true });
    // Выбираем пункт отгрузки
    cy.get('[data-test="search-input-shipment"]')
      .find('input[type=search]')
      .click();
    cy.get('.zaza-dropdown')
      .find('.ant-select-item-option')
      .contains('Екб')
      .click();
    // Нажимаем 'Добавить'
    cy.get('button[type="button"]').contains('Добавить').click().wait(3000);
    // Переходим в корзину
    cy.get('[data-test="to-cart-button"]').click();
    // Нажимаем сохранить заказ
    cy.get('[data-test="save-order"]').click();
    // Проверяем количество созданных ЗАЗ
    cy.get('[data-test="zaza-Новая"]').should('have.length', 2);
  });

  // //https://allure.itlabs.io/project/28/test-cases/6404?treeId=58
  it('#6404 Создание ЗАЗы на отрезной материал', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();

    cy.contains('div', 'Укажите магазин').click();
    cy.contains('div', 'БМ Тмн, Панфиловцев 86/1').click({ force: true });

    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('геотекстиль дорнит');
    //нажать "найти"
    cy.get('[data-test=search-button]').click();
    //нажать кнопку перехода к карточке товара
    cy.get('[data-test=product-link]').first().click();
    // Нажимаем 'Оформить ЗАЗу'
    cy.get('[data-test=ZAZA]').click();

    // Выбираем пункт отгрузки
    cy.get('[data-test="search-input-shipment"]')
      .find('input[type=search]')
      .click();
    cy.get('.zaza-dropdown')
      .find('.ant-select-item-option')
      .contains('Тмн')
      .click();
    // меняем ЕИ на рул
    cy.get('[data-test="modal-edit-units"]').click();
    cy.get('[data-test="unit-ROL"]').click();
    // Нажимаем 'Добавить'
    cy.get('[data-test=add-position-to-cart]').click();
    // Переходим в корзину
    cy.get('[data-test="to-cart-button"]').click();
    // Нажимаем создать заказ
    cy.get('[data-test="make-order"]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
  });

  //https://allure.itlabs.io/project/28/test-cases/4249?treeId=58
  it('#4249 Нельзя оформить ЗаЗу на бетон', () => {
    // Выбираем СД Тюмень
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    // Открываем бетон
    cy.get('[data-test=search-input]').type('бетон');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=product-link]')?.first()?.click({ force: true });
    cy.get('[data-test="search-input-store"]');
    // Нажимаем 'Оформить ЗАЗу'
    cy.get('[data-test=ZAZA]').click();
    cy.get('[data-test="search-input-store"]').click();
    cy.contains('disabled').should('exist');
  });

  //https:allure.itlabs.io/project/28/test-cases/5930?treeId=58
  it('#5930 создание ЗАЗы с колеровкой', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    //выбрать первый магазин
    cy.contains('div', 'Укажите магазин').click();
    cy.contains('div', 'БМ Тмн, Панфиловцев 86/1').click({ force: true });
    //ввести поисковый запрос
    cy.get('[data-test=search-input]').type('краска');
    //нажать "найти"
    cy.get('[data-test=search-button]').click();
    //нажать кнопку перехода к карточке товара
    cy.get('[data-test=product-link]').first().click();
    // Нажимаем 'Оформить ЗАЗу'
    cy.get('[data-test=ZAZA]').click();
    // Выбираем пункт отгрузки
    cy.get('[data-test="search-input-shipment"]')
      .find('input[type=search]')
      .click();
    cy.get('.zaza-dropdown')
      .find('.ant-select-item-option')
      .contains('Екб')
      .click();
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
    cy.get('input[placeholder*="Код"]').type('ACC 0N.00.90');
    cy.get('[data-test="colors-item"]').first().click();
    cy.contains('span', 'Сохранить').click();
    //колеровка добавлена, заза сохранена, заказ создан
    cy.contains('Изменение цвета краски ').should('exist');
    cy.contains('ЗаЗа -').should('exist');
    cy.contains('Заказ №').should('exist');
  });

  //https:allure.itlabs.io/project/28/test-cases/6020?treeId=58
  it('##6020 создание заказа с ЗАЗОЙ и колеровкой, валидация ошибок применения промокода, сертификата', () => {
    cy.openPositionCard('570060');
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
    cy.get('input[placeholder*="Код"]').type('TVT H439');

    cy.get('[data-test="colors-item"]').first().click();
    cy.contains('span', 'Сохранить').click();
    //колеровка добавлена, заза сохранена, заказ создан
    cy.contains('TVT H439').should('exist');
    cy.contains('ЗаЗа -').should('exist');
    cy.contains('Заказ №').should('exist');

    //ввести в инпут количество баллов
    cy.get('input[name="applyingAmount"]').clear().type('1');
    cy.get('[data-test=bonuses-check]').click({ force: true });
    cy.get('[data-test=applying-bonuses]').click({ force: true });
    cy.wait(5000);
    cy.getPromoCodeFromChatRosaMessage('+79000000055').then((promoCode) => {
      cy.get('input[name="sms"]').type(promoCode);
      cy.get('[data-test=confirm-sms-code]').click();
      cy.contains('Код подтвержден').should('exist');
      cy.contains('Успешно сохранено').should('exist');
    });

    cy.get('[class^="_promoPreview__count_"]')
      .invoke('text')
      .then((bonusTotalText) => {
        expect(bonusTotalText).to.eq('-1 баллов');
      });

    cy.contains('TVT H439').should('exist');
    cy.contains('ЗаЗа -').should('exist');
    cy.contains('Заказ №').should('exist');
    //применяем не верный промокод
    cy.contains('div', 'Промокод').click();
    cy.get('[data-test=promocode]').type('CACENTER1');
    cy.get('[data-test=promocode-apply]').click();
    cy.contains('Неверный промокод').should('exist');
    cy.contains('div', 'Промокод').click();
    cy.get('[data-test=promocode]').type('CALLCENTER1');
    cy.get('[data-test=promocode-apply]').click();
    cy.contains('Применили промокод CALLCENTER1').should('exist');
    //В поле "Сертификат" ввести не валидное значение
    cy.get('[data-test=certificate-title]');
    cy.get('[data-test="sertificat"]').type('ERTCALLCENTER');
    cy.get('[data-test="use-sertificat"]').click({ force: true });
    cy.contains('Неверный сертификат').should('exist');
    cy.get('[data-test=certificate-title]').click();
    //зачистить  поле и ввести валидный
    cy.get('[data-test=certificate-title]').click();
    cy.get('[data-test="sertificat"]').clear().type('CERTCALLCENTER');
    cy.get('[data-test="use-sertificat"]').click({ force: true });
    cy.get('[data-test="certificate-value"]').click().type('2');
    cy.get('[data-test=use]').click();
    // проверка
    cy.contains('TVT H439').should('exist');
    cy.contains('ЗаЗа -').should('exist');
    cy.contains('Заказ №').should('exist');
    cy.contains('Списано').should('exist');
    cy.contains('Перс. цена').should('exist');
  });
});
