/**
 * GDPRConsent Model
 * 
 * Логіка згоди на використання cookies.
 */
export function* GDPRConsent(options = {}) {
    const { accepted = false, onAccept } = options

    if (accepted) {
        yield { type: 'log', level: 'info', message: 'GDPR already accepted' }
        return { accepted: true }
    }

    yield { 
        type: 'progress', 
        message: 'Requesting GDPR consent' 
    }

    const consent = yield {
        type: 'ask',
        field: 'consent',
        schema: {
            title: 'Cookie Consent',
            help: 'We use cookies to improve your experience.',
            options: [
                { value: 'all', label: 'Accept All' },
                { value: 'necessary', label: 'Necessary Only' }
            ]
        }
    }

    yield { type: 'log', level: 'success', message: `User chose: ${consent}` }

    if (onAccept) onAccept(consent)

    return { accepted: true, mode: consent }
}
