export const exampleOfFormat = `
NaN0 format file structure:
  array when empty: []
  array when have values:
    - object with some values:
      name: Some values
    - 160_000_500.345
    - |
      multiple line
      string
      only with the | no other symbols are available
  object when empty: {}
  # comment inline
  # second comment inline
  object when have values:
    name as a one line string: One line, possible with "
    name as a one line with quotes: "Only double quotes are possible \\" escaped quotes"
    # multiline comment
      as simple, as object or text comment.
      What do you want to know?
    string as a multiline: |
      only with the | char,
      no other symbols
    date as a one line value only: 2024-11-13
    datetime as one line value only: 2024-11-13T19:34:00
    short datetime: 2024-11-13T19:34:00
    number as integer: 160_000_500
    number as a float: 160_000_500.345
    negative number: -160_000_500.345
    boolean: true
    null: null`

export const exampleOfExpected = {
	'NaN0 format file structure': {
		'array when empty': [],
		'array when have values': [
			{ 'object with some values': { name: 'Some values' } },
			160_000_500.345,
			'multiple line\nstring\nonly with the | no other symbols are available',
		],
		'object when empty': {},
		'object when have values': {
			'name as a one line string': 'One line, possible with "',
			'name as a one line with quotes': 'Only double quotes are possible " escaped quotes',
			'string as a multiline': 'only with the | char,\nno other symbols',
			'date as a one line value only': new Date('2024-11-13'),
			'datetime as one line value only': new Date('2024-11-13T19:34:00'),
			'short datetime': new Date('2024-11-13T19:34:00'),
			'number as integer': 160_000_500,
			'number as a float': 160_000_500.345,
			'negative number': -160_000_500.345,
			boolean: true,
			null: null,
		},
	},
}

export const exampleOfComments = [
	{
		text: 'comment inline\nsecond comment inline',
		id: 'NaN0 format file structure.object when have values',
	},
	{
		text: 'ultiline comment\nas simple, as object or text comment.\nWhat do you want to know?',
		id: 'NaN0 format file structure.object when have values.string as a multiline',
	},
]
