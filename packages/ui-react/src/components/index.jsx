import Button from './atoms/Button.jsx'
import Input from './atoms/Input.jsx'
import Typography from './atoms/Typography.jsx'
import Avatar from './atoms/Avatar.jsx'
import Badge from './atoms/Badge.jsx'
import Checkbox from './atoms/Checkbox.jsx'
import Radio from './atoms/Radio.jsx'
import Select from './atoms/Select.jsx'
import TextArea from './atoms/TextArea.jsx'
import Card from './molecules/Card.jsx'
import Modal from './organisms/Modal.jsx'
import GDPRConsent from './organisms/GDPRConsent.jsx'
import FeedbackForm from './organisms/FeedbackForm.jsx'
import NewsPost from './organisms/NewsPost.jsx'
import ThemeSwitcher from './atoms/ThemeSwitcher.jsx'

/** @type {Map<string, React.Component<any, any, any>>} */
// @ts-ignore @todo fix if you able to
const components = new Map([
	// Capitalized (original)
	['Button', Button],
	['Input', Input],
	['Typography', Typography],
	['Avatar', Avatar],
	['Badge', Badge],
	['Checkbox', Checkbox],
	['Radio', Radio],
	['Select', Select],
	['TextArea', TextArea],
	['Card', Card],
	['Modal', Modal],
	['GDPRConsent', GDPRConsent],
	['FeedbackForm', FeedbackForm],
	['NewsPost', NewsPost],
	['ThemeSwitcher', ThemeSwitcher],
	// Lowercase (for case-insensitive lookup)
	['button', Button],
	['input', Input],
	['typography', Typography],
	['avatar', Avatar],
	['badge', Badge],
	['checkbox', Checkbox],
	['radio', Radio],
	['select', Select],
	['textarea', TextArea],
	['card', Card],
	['modal', Modal],
	['gdprconsent', GDPRConsent],
	['feedbackform', FeedbackForm],
	['newspost', NewsPost],
	['themeswitcher', ThemeSwitcher],
])

export default components
