import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="language-switch" role="group" aria-label="Language">
      {languages.map((language) => (
        <button
          key={language.code}
          className={i18n.resolvedLanguage === language.code ? 'active' : ''}
          onClick={() => i18n.changeLanguage(language.code)}
        >
          {language.label}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher