describe('создание и редактирование обращения', () => {
  beforeEach(() => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.login();
  });

  //https:allure.itlabs.io/project/28/test-cases/4415?treeId=58
  it('#4415 Добавление услуги доставки и разгрузки через причину обращения "редактирование заказа"', () => {
    cy.createAppeal({ auth: { type: 'phone', value: '9000000011' } });
    cy.get('[data-test=select-appeal]').click();
    // Выбираем 'Новый заказ'
    cy.contains('Новый заказ').click();
    // Нажимаем на список магазинов
    cy
      .get('.ant-select-selection-overflow-item')
      ?.first()
      ?.click({ force: true });
    // Выбираем первый магазин
    cy.get('.ant-select-item-option-content').first().click({ force: true });
    // Включаем скрыть нулевые остатки
    cy.get('[data-test=remain-switch]').then(($switch) => {
      if ($switch.attr('aria-checked') === 'false') {
        cy.wrap($switch).click();
      }
    });
    // Пишем в поисковый инпут текст
    cy.get('[data-test=search-input]').type('d');
    // Кликаем на кнопку поиска
    cy.get('[data-test=search-button]').click();
    // Открываем модалку быстрого добавления у первого товара из списка
    cy.get('[data-test=shopping-card-button]')?.first()?.click();
    // Добавили товар в корзину
    cy.get('.ant-btn-primary').contains('Добавить').click();
    // Перешли в корзину
    cy.get('[data-test=to-cart-button]').click();
    // Нажали кнопку создать заказ
    cy.get('[data-test=make-order]');
    // cy.contains('div', 'Создать заказ').click();
    cy.contains('Заказ №')
      .invoke('text')
      .then((text) => {
        const orderNumber = text.match(/\d+/)[0];

        cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
        cy.createAppeal({ auth: { type: 'phone', value: '9000000011' } });
        cy.get('[data-test=select-appeal]').click();
        // Выбираем 'Новый заказ'
        cy.contains('Редактирование заказа').click();
        cy.get('input[type=text]').type(orderNumber);
        cy.contains('button', 'Найти').click();
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
        cy.get('[data-test=btn-add-unloading]').click();
        cy.get('input[value="climb"]').click();
        cy.get('input[name="floor"]').first().click();
        cy.get('input[value="false"]').click();
        cy.get('input[value="30"]').click();
        cy.wait(2000);
        cy.contains('span', 'Добавить услугу').click();
        cy.get('[data-test=delivery-ttn-save]').click();
        cy.contains('Доставка успешно сохранена!').should('exist');
        cy.get('[data-test=link-back]').click();
        cy.wait(5000);
        cy.get('[data-test=save-order]').click();
        cy.contains('Доставки').should('exist');
        cy.contains('Услуга разгрузки').should('exist');
      });
  });

  //https://allure.itlabs.io/project/28/test-cases/3350?treeId=58
  // тест не готов, нужна команда на скрол
  it('#3350 Шаблоны СМС из хэдра/корзины', () => {
    cy.createAppeal({ auth: { type: 'phone', value: '9000000011' } });
    cy.get('[data-test=select-appeal]').click();
    // Выбираем 'Новый заказ'
    cy.contains('Новый заказ').click();
    cy.contains('span', 'Отправить СМС').click();
    cy.get('input[placeholder*="Телефон"]').clear().type('9000000011');

    cy.get('[data-test=empty-form]').type('Текстовый комментарий2..');
    cy.get('[data-test=send-sms-for]').click();
    cy.contains('Сообщение успешно отправлено').should('exist');
    // // выбираем шаблон 1
    // cy.contains('span', 'Отправить СМС').click();
    // cy.get('[data-test=pattern-sms]').click();
    // cy.contains('div', 'Заказ. Номер и сумма.').click();
    // cy.contains('Ваш заказ № 0, сумма к оплате 0.00р.').should('exist');
    // cy.get('[data-test=send-sms-for]').click();
    // cy.contains('Сообщение успешно отправлено').should('exist');
    // // выбираем шаблон 2
    // cy.contains('span', 'Отправить СМС').click();
    // cy.get('[data-test=pattern-sms]').click();
    // cy.contains('div', 'Заказ. Номер сумма, адрес самовывоза').click();
    // cy.contains(
    //   'Заказ 0 на 0.00р. Можно забрать на %PLANT_ADDR%. QR для получения',
    // ).should('exist');
    // cy.get('[data-test=send-sms-for]').click();
    // cy.contains('Сообщение успешно отправлено').should('exist');
    // // выбираем шаблон 3
    // cy.contains('span', 'Отправить СМС').click();
    // cy.get('[data-test=pattern-sms]').click();
    // cy.contains('div', 'Заказ. Номер, сумма, доставка в течение дня.').click();
    // cy.contains(
    //   'Ваш заказ № 0, сумма к оплате 0.00р. Доставка %DELIV_DAY% в течение дня.',
    // ).should('exist');
    // cy.get('[data-test=send-sms-for]').click();
    // cy.contains('Сообщение успешно отправлено').should('exist');
    // // выбираем шаблон 4
    // cy.contains('span', 'Отправить СМС').click();
    // cy.get('[data-test=pattern-sms]').click();
    // cy.contains('div', 'Заказ. Номер, сумма, дата доставки').click();
    // cy.contains(
    //   'Ваш заказ № 0, сумма к оплате 0.00р. Доставка %DELIV_DATETIME%',
    // ).should('exist');
    // cy.get('[data-test=send-sms-for]').click();
    // cy.contains('Сообщение успешно отправлено').should('exist');
    // // выбираем шаблон 5
    // cy.contains('span', 'Отправить СМС').click();
    // cy.get('[data-test=pattern-sms]').click();
    // cy.contains(
    //   'div',
    //   'Заказ. Доставка отменена. Номер, дата доставки.',
    // ).click();
    // cy.contains(
    //   'Заказ 0, доставка %DELIV_DATETIME%. Вы не вышли на связь, доставка отменена, просьба связаться по тел.',
    // ).should('exist');
    // cy.get('[data-test=send-sms-for]').click();
    // cy.contains('Сообщение успешно отправлено').should('exist');
    // // выбираем шаблон 6
    // cy.contains('span', 'Отправить СМС').click();
    // cy.get('[data-test=pattern-sms]').click();
    // cy.contains('div', 'СМС клиенту с извинением и промокодом').click();
    // cy.contains(
    //   'В качестве извинения, дарим Вам индивидуальный промокод со скидкой до',
    // ).should('exist');
    // cy.get('[data-test=send-sms-for]').click();
    // cy.contains('Сообщение успешно отправлено').should('exist');
    // // выбираем шаблон 7
    // cy.contains('span', 'Отправить СМС').click();
    // cy.get('[data-test=pattern-sms]').click();
    // cy.contains('div', 'Возврат. Номер заказа').click();
    // cy.contains('Заказ на возврат ').should('exist');
    // cy.get('[data-test=send-sms-for]').click();
    // cy.contains('Сообщение успешно отправлено').should('exist');
    // // выбираем шаблон 8
    // cy.contains('span', 'Отправить СМС').click();
    // cy.get('[data-test=pattern-sms]').click();
    // cy.contains('div', 'Заза. Номер, сумма, адрес самовывоза, дата').click();
    // cy.contains('Заказ 0 на 0.00 р. Можно забрать на ').should('exist');
    // cy.get('[data-test=send-sms-for]').click();
    // cy.contains('Сообщение успешно отправлено').should('exist');
    // // выбираем шаблон 9
    // cy.contains('span', 'Отправить СМС').click();
    // cy.get('[data-test=pattern-sms]').click();
    // cy.contains('div', 'Контакт. Для физических лиц').click();
    // cy.contains(
    //   'Заявку можно отправить на адрес эл. почты cc@sdvor.com',
    // ).should('exist');
    // cy.get('[data-test=send-sms-for]').click();
    // cy.contains('Сообщение успешно отправлено').should('exist');
    // // выбираем шаблон 10
    // cy.contains('span', 'Отправить СМС').click();
    // cy.get('[data-test=pattern-sms]').click();
    // cy.contains('div', 'Интернет заказ. Доставка.').click();
    // cy.contains(
    //   'По заказу %SORDER_NUM%: доставка %DELIV_DATETIME%. К оплате 0.00',
    // ).should('exist');
    // cy.get('[data-test=empty-form]').type('Добавьте свой тескт');
    // cy.get('[data-test=send-sms-for]').click();
    // cy.contains('Сообщение успешно отправлено').should('exist');

    // выбираем шаблон 9
    cy.contains('span', 'Отправить СМС').click();
    cy.get('[data-test=pattern-sms]').click();

    function scrollUntilFound() {
      cy.get(
        '.ant-select-dropdown.ant-select-dropdown-placement-bottomLeft',
      ).then(($dropdown) => {
        const dropdown = $dropdown[0];
        const target = dropdown.querySelector(
          '.ant-select-item:contains("Контакт. КП новых поставщиков")',
        );

        if (target) {
          // Элемент найден, скроллим к нему
          target.scrollIntoView();
          return;
        }

        // Элемент не найден, скроллим дальше
        const scrollContainer = dropdown.querySelector(
          '.rc-virtual-list-holder',
        );
        const currentScroll = scrollContainer.scrollTop;
        const maxScroll =
          scrollContainer.scrollHeight - scrollContainer.clientHeight;

        if (currentScroll >= maxScroll) {
          throw new Error('Элемент не найден после скролла до конца');
        }

        // Скроллим на одну высоту элемента
        scrollContainer.scrollTop += 100;

        // Ждем и проверяем снова
        cy.wait(200).then(scrollUntilFound);
      });
    }

    // Запускаем скролл
    // scrollUntilFound();
    // cy.contains('.ant-select-item', 'Контакт. КП новых поставщиков').click();

    cy.get('[data-test=pattern-sms]').click();
    cy.get('[data-test=pattern-sms]')
      .find('.rc-virtual-list-holder')
      .then(($el) => {
        const el = $el[0];
        const getStep = () => {
          const row =
            el.querySelector('.rc-virtual-list-holder-inner') || el.children[0];
          return row ? Math.ceil(row.getBoundingClientRect().height) : 50;
        };

        function scrollStep() {
          if (el.querySelector('[data-test="Контакт. КП новых поставщиков"]')) {
            return cy.wrap(
              el.querySelector('[data-test="Контакт. КП новых поставщиков"]'),
            );
          }
          const prev = el.scrollTop;
          el.scrollTop = Math.min(
            el.scrollTop + getStep(),
            el.scrollHeight - el.clientHeight,
          );
          el.dispatchEvent(new Event('scroll', { bubbles: true }));
          if (el.scrollTop === prev) {
            throw new Error('Не найден элемент, дошли до конца списка');
          }
          return cy.wait(100).then(scrollStep);
        }

        return scrollStep();
      });
    cy.get('[data-test="Контакт. КП новых поставщиков"]')
      .click({ force: true })
      .pause();

    // После скролла кликаем на элемент
    cy.contains('Контакт. КП новых поставщиков').click();

    cy.contains('Контакт. КП новых поставщиков').click({ force: true });
    cy.contains('Ждем КП на адрес эл.почты comerc_pred@sdvor.com ').should(
      'exist',
    );
    cy.get('[data-test=send-sms-for]').click();
    cy.contains('Сообщение успешно отправлено').should('exist');
  });
});
