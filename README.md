# Лексический редупликатор

## Предупреждение
**Внимание! Исходный код содержит ненормативную лексику!**

## Общая информация
`reduplicator` - библиотека для Node.js, написанная на TypeSript (при разработке использована версия 3.2.4). Не имеет внешних зависимостей, кроме devDependencies.

## Для чего может пригодиться?
Есть опыт использования, например, в чат-ботах.

## Что это такое?
Лексическая-х\*ическая редупликация-х\*епликация.

Более подробную информацию про лексическую редупликацию можно найти в [Википедии](https://ru.wikipedia.org/wiki/%D0%A0%D0%B5%D0%B4%D1%83%D0%BF%D0%BB%D0%B8%D0%BA%D0%B0%D1%86%D0%B8%D1%8F_%D0%B2_%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%BE%D0%BC_%D1%8F%D0%B7%D1%8B%D0%BA%D0%B5).

Для слова вычисляет его х*ефицированную форму. Примеры:
* привет -> х\*евет
* собака -> х\*яка
* холодильник -> х\*едильник
* водоворот -> х\*еворот
* бзглснхбкв -> `null`

В случае невозможности построить х*ефицированную форму возвращается `null`.

## Ударения в словах
На то, какая будет гласная после префикса "ху" и сколько будет слогов в итоговом слове, влияет ударение в слове исходном. Судите сами:
* собáка -> х\*яка
* со́бака -> х\*ёбака

Поэтому `reduplicator` внутри себя использует словарь ударений. **Словарь весит около 90Мб.**

## Использование
### REPL
Поиграться в консоли можно, склонировав репозиторий и запустив REPL: `npm run repl`.

### В коде
Самый главный класс библиотеки - `Reduplicator`.

Редупликатору для работы нужна реализация интерфейса `StressManager`. То есть *нечто, что умеет определять ударение в слове*. Сейчас таких реализаций написано две:
* `DefaultStressManager` - работает с уже готовым словарем в формате JSON
* `DynamicStressManager` - умеет работать с уже готовым словарем, но также умеет вести пользовательский словарь.

Можно написать свою реализацию с произвольной логикой.

**Самый простой вариант использования в JavaScript:**
```javascript
const DefaultStressManager = require('reduplicator').DefaultStressManager;
const Reduplicator = require('reduplicator').Reduplicator;

const dict = new DefaultStressManager();
const r = new Reduplicator(dict);
r.reduplicate('собака'); // => х*яка
```

Если мы хотим использовать дефолтный словарь, но также иметь возможность указывать редупликатору правильные ударения в словах (подробнее о пользовательских ударениях - ниже):
```javascript
const dict = new DynamicStressManager();
const r = new Reduplicator(dict);
r.reduplicate('сОбака'); // => х*ёбака
r.reduplicate('собАка'); // => х*яка
r.reduplicate('собака'); // => х*яка - ударение возьмется из дефолтного словаря
```

`DynamicDictionaryManager` анализирует регистр букв в слове и, если одна гласная буква в нем написана капсом (например, "москвА"), посчитает ее ударной.

### Пользовательский словарь ударений
Если в дефолтном словаре нет какого-то слова, для него редупликатор может давать неправильные результаты. Решить эту проблему можно с помощью пользовательских словарей. Так вы можете сообщить редупликатору ударения для новых слов или переопределить ударения в старых.

Для этого подходит все тот же `DynamicDictionaryManager`.

Его конструктор принимает два необязательных параметра:
 * путь к JSON-файлу с пользовательским словарем ударений; на момент создания объекта файл не обязательно должен существовать
 * второй параметр - `boolean`, если его установить в `true`, пользовательский словарь будет read-only. Это может быть полезно, если вы хотите подложить какие-то свои слова, но не доверяете пользователям изменять словарь.

JSON-файл со словарем должен иметь формат "слово -> zero-based индекс ударной буквы". 

Например, чтобы переопределить дефолтное ударение в слове "собака", как будто оно падает на первый слог, т.е. букву "о" (индекс буквы "о" - 1), создайте файл `custom.json` со следующим контентом:
```json
{
	"собака": 1
}
```

В коде создайте экземпляр `DynamicStressManager` и передайте ему путь к словарю:

```javascript
const dict = new DynamicStressManager('./custom.json', true);
const r = new Reduplicator(dict);
r.reduplicate('сОбака'); // => х*ёбака
```

Если путь к кастомному словарю не был передан, `DynamicStressManager` будет все так же считать капс ударением, но **ударение сохранено не будет, даже в памяти.** Возможно, в будущем реализация изменится. Пока что это видится странным, т.к. при перезапуске приложения все равно все потеряется.

Также примеры использования в коде можно посмотреть в тестах и в `repl.ts`.

## Тесты
`npm run test`

## Кредиты
Словарь ударений составлен из словаря "Полная парадигма. Морфология. Частотный словарь. Совмещенный словарь. Автор М. Хаген", доступного [тут](http://www.speakrus.ru/dict/).