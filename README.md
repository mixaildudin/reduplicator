# Лексический редупликатор

[![npm](https://img.shields.io/npm/v/reduplicator)](https://npmjs.com/package/reduplicator)
[![npm](https://img.shields.io/npm/l/reduplicator)](https://github.com/mixaildudin/reduplicator/blob/master/LICENSE.md)

**Внимание! Исходный код содержит ненормативную лексику!**
Здесь, в readme, все нецензурные слова прикрыты звёздочками. Х*ёздочками.

## Что это такое?
Лексическая-х\*ическая редупликация-х\*епликация.

Более подробную информацию про лексическую редупликацию можно найти в [Википедии](https://ru.wikipedia.org/wiki/%D0%A0%D0%B5%D0%B4%D1%83%D0%BF%D0%BB%D0%B8%D0%BA%D0%B0%D1%86%D0%B8%D1%8F_%D0%B2_%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%BE%D0%BC_%D1%8F%D0%B7%D1%8B%D0%BA%D0%B5).

Данная библиотека для слова вычисляет его х*ефицированную форму. Примеры:
* привет -> х\*евет
* собака -> х\*яка
* холодильник -> х\*едильник
* водоворот -> х\*еворот
* бзглснхбкв -> `null`

Как видно, в последнем случае построить х*ефицированную форму не удалось.

#### Особенности
* Нет внешних зависимостей
* Синхронный API

## Демо
Попробовать библиотеку можно на [демо-странице](https://reduplicator-demo.herokuapp.com/).

Также можно поиграться в консоли: клонируем репозиторий, выполняем `npm i` и запускаем REPL: `npm run repl`.

## Использование

#### Самый простой вариант использования
```javascript
const { DefaultStressManager, Reduplicator } = require('reduplicator');

const dict = new DefaultStressManager();
const r = new Reduplicator(dict);
r.reduplicate('собака'); // => х*яка
```

#### Как это работает
На то, какая будет гласная после префикса "ху" и сколько будет слогов в итоговом слове, влияет ударение в исходном слове. Пример:
* собáка -> х\*яка
* со́бака -> х\*ёбака

Поэтому редупликатору для работы нужна реализация [интерфейса](https://github.com/mixaildudin/reduplicator/blob/master/src/interfaces/stressManager.ts) `StressManager`. То есть *нечто, что умеет определять ударение в слове*. Сейчас таких реализации написано три:
* `DefaultStressManager` - работает со встроенным словарем ударений
* `DynamicStressManager` - умеет работать со встроенным словарем, но пользователи также могут указать ему какое-то своё ударение в слове
* `NullStressManager` - всегда отвечает, что ударение неизвестно и не использует словарь ударений. Может пригодиться для случаев, когда мало памяти и загружать в нее словарь нет возможности.
Разумеется, результат работы редупликатора будет хуже

В теории можно легко написать свою реализацию с произвольной логикой.

#### Продвинутый вариант использования
Если мы хотим использовать встроенный словарь ударений, но также иметь возможность указывать редупликатору кастомные ударения в словах:
```javascript
const { DynamicStressManager, Reduplicator } = require('reduplicator');

const dict = new DynamicStressManager();
const r = new Reduplicator(dict);

r.reduplicate('сОбака'); // => х*ёбака
r.reduplicate('собАка'); // => х*яка
r.reduplicate('собака'); // => х*яка - ударение возьмется из встроенного словаря
```

`DynamicDictionaryManager` анализирует регистр букв в слове и, если одна и только одна гласная буква в нем написана капсом (например, "москвА"), посчитает ее ударной.
Эти ударения можно сохранять в кастомный словарь, который переопределяет встроенный. Об этом - ниже.

#### Пользовательский словарь ударений
Если во встроенном словаре нет какого-то слова, для него редупликатор может давать не совсем правильный результат. Решить эту проблему можно с помощью пользовательского словаря. Так вы можете сообщить редупликатору ударения для слов, которых нет во встроенном словаре, или переопределить ударения для тех, которые есть.

Для этого подходит все тот же `DynamicDictionaryManager`.

Его конструктор принимает два необязательных параметра:
 * путь к JSON-файлу с пользовательским словарем ударений (на момент создания объекта файл не обязательно должен существовать)
 * второй параметр - `boolean`, если его установить в `true`, пользовательский словарь будет read-only. Это может быть полезно, если вы хотите подложить какие-то свои слова, но не доверяете пользователям изменять словарь.

JSON-файл со словарем должен иметь формат "слово -> zero-based индекс ударной буквы".

Например, чтобы переопределить дефолтное ударение в слове "собака", как будто оно падает на первый слог, т.е. букву "о" (индекс буквы "о" - 1), создайте файл `custom.json` со следующим содержимым:
```json
{
  "собака": 1
}
```

В коде создайте экземпляр `DynamicStressManager` и передайте ему путь к словарю:

```javascript
const path = require('path');
const { DynamicStressManager, Reduplicator } = require('reduplicator');

// допустим, путь к вашему словарю такой
const customDictionaryPath = path.join(__dirname, './custom.json');

const dict = new DynamicStressManager(customDictionaryPath, true);
const r = new Reduplicator(dict);
r.reduplicate('сОбака'); // => х*ёбака
```

Если путь к кастомному словарю не был передан, `DynamicStressManager` будет все так же считать капс ударением, но **ударение сохранено не будет, даже в памяти.** Возможно, в будущем реализация изменится. Пока что это видится странным, т.к. при перезапуске приложения все равно все потеряется.

Также примеры использования в коде можно посмотреть в тестах и в `repl.ts`.

## Тесты
`npm run test`

## Что нового
#### v1.1.1
* В readme добавлена ссылка на демо-страницу
* Небольшие улучшения в коде

#### v1.1.0
* Инициализация редупликатора ускорена приблизительно в 25 раз
* Потребление оперативной памяти снижено в 5 раз
* Объем пакета в распакованном виде уменьшен в 11 раз
* Улучшена обработка слов, содержащих дефисы
* Добавлен `NullStressManager`

## Кредиты
Словарь ударений составлен из словаря "Полная парадигма. Морфология. Частотный словарь. Совмещенный словарь. Автор М. Хаген", доступного [тут](http://www.speakrus.ru/dict/).

## Фидбэк
Предложения, баг-репорты, звезды на гитхабе, пулл-реквесты - любой фидбэк приветствуется.
