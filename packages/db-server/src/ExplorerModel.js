import { Model } from '@nan0web/types'

/**
 * ExplorerModel — i18n schema for DB Server Web Explorer UI.
 * All static fields are scanned by @nan0web/i18n for dictionary extraction.
 */
export class ExplorerModel extends Model {
	static brand = {
		help: 'Brand name displayed in header',
		default: 'NaN0Web Explorer',
	}

	static filesPanelTitle = {
		help: 'Files panel header title',
		default: 'Файли та Директорії',
	}

	static breadcrumbsRoot = {
		help: 'Breadcrumb label for root directory',
		default: 'root',
	}

	static viewModeFetch = {
		help: 'View mode option: db.fetch()',
		default: 'db.fetch()',
	}

	static viewModeGet = {
		help: 'View mode option: db.get()',
		default: 'db.get()',
	}

	static refreshButton = {
		help: 'Refresh button label',
		default: '🔄 Оновити',
	}

	static saveButton = {
		help: 'Save button label',
		default: '💾 Зберегти (Ctrl+S)',
	}

	static deleteButton = {
		help: 'Delete button label',
		default: '🗑 Видалити',
	}

	static noFileSelected = {
		help: 'Placeholder text when no file is selected',
		default: 'Оберіть файл зі списку для перегляду або редагування...',
	}

	static emptyStatePrompt = {
		help: 'Empty state prompt text',
		default: 'Оберіть документ зі списку ліворуч',
	}

	static statusReady = {
		help: 'Status bar message when ready',
		default: 'Готовий до роботи',
	}

	static statusLoadingDir = {
		help: 'Status message while loading directory',
		default: 'Завантаження директорії...',
	}

	static statusLoadError = {
		help: 'Error message when directory load fails',
		default: 'Помилка завантаження каталогу',
	}

	static statusLoadedCount = {
		help: 'Status message after loading N items',
		default: 'Завантажено {{count}} елементів',
	}

	static statusLoadingFile = {
		help: 'Status message while loading a file',
		default: 'Завантаження {{uri}}...',
	}

	static statusFileLoaded = {
		help: 'Status message after file loaded',
		default: 'Файл {{uri}} завантажено',
	}

	static statusFileLoadError = {
		help: 'Error message when file load fails',
		default: 'Помилка завантаження: {{error}}',
	}

	static statusSavingFile = {
		help: 'Status message while saving a file',
		default: 'Збереження {{uri}}...',
	}

	static statusSaved = {
		help: 'Status message after successful save',
		default: 'Успішно збережено: {{uri}}',
	}

	static statusSaveError = {
		help: 'Error message when save fails',
		default: 'Помилка збереження: {{error}}',
	}

	static statusDeleted = {
		help: 'Status message after file deleted',
		default: 'Файл {{uri}} видалено',
	}

	static statusDeleteError = {
		help: 'Error message when delete fails',
		default: 'Помилка видалення: {{error}}',
	}

	static confirmDelete = {
		help: 'Confirmation dialog text before deleting',
		default: 'Видалити файл {{uri}}?',
	}

	static editorNoFile = {
		help: 'Editor toolbar text when no file is active',
		default: 'Файл не обрано',
	}

	static apiDocsTitle = {
		help: 'API documentation page title',
		default: '@nan0web/db-server REST API',
	}

	static apiDocsDescription = {
		help: 'API documentation description',
		default: 'High-performance HTTP REST interface for @nan0web/db document store and file system',
	}

	static healthOk = {
		help: 'Health check status value',
		default: 'ok',
	}

	static healthService = {
		help: 'Health check service identifier',
		default: 'db-server',
	}

	static notFoundError = {
		help: 'Error message for missing documents',
		default: 'Not found',
	}

	static missingUriError = {
		help: 'Error message when URI field is missing in POST body',
		default: 'Missing "uri" field',
	}

	static missingDocumentError = {
		help: 'Error message when document field is missing in POST body',
		default: 'Missing "document" field',
	}

	static saveFailedError = {
		help: 'Error message when saveDocument returns false',
		default: 'saveDocument returned false',
	}

	static dropFailedError = {
		help: 'Error message when dropDocument returns false',
		default: 'dropDocument returned false',
	}

	static serverRequiresDb = {
		help: 'Error message when DBServer is created without db instance',
		default: 'DBServer requires a db instance',
	}

	constructor(data = {}) {
		super(data)
		this.brand = data.brand ?? ExplorerModel.brand.default
		this.filesPanelTitle = data.filesPanelTitle ?? ExplorerModel.filesPanelTitle.default
		this.breadcrumbsRoot = data.breadcrumbsRoot ?? ExplorerModel.breadcrumbsRoot.default
		this.viewModeFetch = data.viewModeFetch ?? ExplorerModel.viewModeFetch.default
		this.viewModeGet = data.viewModeGet ?? ExplorerModel.viewModeGet.default
		this.refreshButton = data.refreshButton ?? ExplorerModel.refreshButton.default
		this.saveButton = data.saveButton ?? ExplorerModel.saveButton.default
		this.deleteButton = data.deleteButton ?? ExplorerModel.deleteButton.default
		this.noFileSelected = data.noFileSelected ?? ExplorerModel.noFileSelected.default
		this.emptyStatePrompt = data.emptyStatePrompt ?? ExplorerModel.emptyStatePrompt.default
		this.statusReady = data.statusReady ?? ExplorerModel.statusReady.default
		this.statusLoadingDir = data.statusLoadingDir ?? ExplorerModel.statusLoadingDir.default
		this.statusLoadError = data.statusLoadError ?? ExplorerModel.statusLoadError.default
		this.statusLoadedCount = data.statusLoadedCount ?? ExplorerModel.statusLoadedCount.default
		this.statusLoadingFile = data.statusLoadingFile ?? ExplorerModel.statusLoadingFile.default
		this.statusFileLoaded = data.statusFileLoaded ?? ExplorerModel.statusFileLoaded.default
		this.statusFileLoadError = data.statusFileLoadError ?? ExplorerModel.statusFileLoadError.default
		this.statusSavingFile = data.statusSavingFile ?? ExplorerModel.statusSavingFile.default
		this.statusSaved = data.statusSaved ?? ExplorerModel.statusSaved.default
		this.statusSaveError = data.statusSaveError ?? ExplorerModel.statusSaveError.default
		this.statusDeleted = data.statusDeleted ?? ExplorerModel.statusDeleted.default
		this.statusDeleteError = data.statusDeleteError ?? ExplorerModel.statusDeleteError.default
		this.confirmDelete = data.confirmDelete ?? ExplorerModel.confirmDelete.default
		this.editorNoFile = data.editorNoFile ?? ExplorerModel.editorNoFile.default
		this.apiDocsTitle = data.apiDocsTitle ?? ExplorerModel.apiDocsTitle.default
		this.apiDocsDescription = data.apiDocsDescription ?? ExplorerModel.apiDocsDescription.default
		this.healthOk = data.healthOk ?? ExplorerModel.healthOk.default
		this.healthService = data.healthService ?? ExplorerModel.healthService.default
		this.notFoundError = data.notFoundError ?? ExplorerModel.notFoundError.default
		this.missingUriError = data.missingUriError ?? ExplorerModel.missingUriError.default
		this.missingDocumentError = data.missingDocumentError ?? ExplorerModel.missingDocumentError.default
		this.saveFailedError = data.saveFailedError ?? ExplorerModel.saveFailedError.default
		this.dropFailedError = data.dropFailedError ?? ExplorerModel.dropFailedError.default
		this.serverRequiresDb = data.serverRequiresDb ?? ExplorerModel.serverRequiresDb.default
	}
}
