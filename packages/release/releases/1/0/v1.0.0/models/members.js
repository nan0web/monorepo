import { Contact } from "@nan0web/co"
import Person from "./Person.js"

export default {
	YaRaSLove: new Person({
		name: "YaRaSLove",
		contacts: [
			new Contact("https://yaro.page"),
			new Contact("mailto:support@yaro.page"),
			new Contact("tel:00380673861050"),
		],
		gpgKey: "?"
	}),
}
