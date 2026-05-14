export const exampleOfFormat: "\nNaN0 format file structure:\n  array when empty: []\n  array when have values:\n    - object with some values:\n      name: Some values\n    - 160_000_500.345\n    - |\n      multiple line\n      string\n      only with the | no other symbols are available\n  object when empty: {}\n  # comment inline\n  # second comment inline\n  object when have values:\n    name as a one line string: One line, possible with \"\n    name as a one line with quotes: \"Only double quotes are possible \\\" escaped quotes\"\n    # multiline comment\n      as simple, as object or text comment.\n      What do you want to know?\n    string as a multiline: |\n      only with the | char,\n      no other symbols\n    date as a one line value only: 2024-11-13\n    datetime as one line value only: 2024-11-13T19:34:00\n    short datetime: 2024-11-13T19:34:00\n    number as integer: 160_000_500\n    number as a float: 160_000_500.345\n    negative number: -160_000_500.345\n    boolean: true\n    null: null";
export const exampleOfExpected: {
    'NaN0 format file structure': {
        'array when empty': never[];
        'array when have values': (string | number | {
            'object with some values': {
                name: string;
            };
        })[];
        'object when empty': {};
        'object when have values': {
            'name as a one line string': string;
            'name as a one line with quotes': string;
            'string as a multiline': string;
            'date as a one line value only': Date;
            'datetime as one line value only': Date;
            'short datetime': Date;
            'number as integer': number;
            'number as a float': number;
            'negative number': number;
            boolean: boolean;
            null: null;
        };
    };
};
export const exampleOfComments: {
    text: string;
    id: string;
}[];
