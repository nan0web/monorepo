import React, { useState, useEffect, useRef } from 'react'
import { useUI } from '@nan0web/ui-react'
import { BsSearch } from 'react-icons/bs'
import { useHeaderNav } from './useHeaderNav.js'
import './Header.v2.css'

const NavItemRenderer = ({ item, level = 0, index, activePath, onToggle }) => {
	const children = item.items || item.children
	const hasChildren = children && children.length > 0
	const id = `${level}-${index}`
	const isShow = activePath && activePath.includes(id)

	const handleClick = (e) => {
		if (hasChildren) {
			e.preventDefault()
			onToggle(id, level)
		}
	}

	const icon =
		(level === 0 || level > 1) && item.icon ? (
			<span className={`icon-${item.icon} me-1`}></span>
		) : null

	if (level === 0) {
		return (
			<li className={`nav-item ${hasChildren ? 'dropdown' : ''}`} key={index}>
				<a
					href={item.href || '#'}
					onClick={handleClick}
					className={`nav-link ${hasChildren ? 'dropdown-toggle' : ''} ${isShow ? 'show' : ''} d-flex align-items-center`}
				>
					{icon}
					<span>{item.title}</span>
				</a>
				{hasChildren && isShow && (
					<ul className={`dropdown-menu show start`}>
						{children.map((child, idx) => (
							<NavItemRenderer
								key={idx}
								item={child}
								level={level + 1}
								index={`${index}-${idx}`}
								onToggle={onToggle}
								activePath={activePath}
							/>
						))}
					</ul>
				)}
			</li>
		)
	}

	// Level 1: Horizontal Bar Item
	if (level === 1) {
		return (
			<li className="nav-item" key={index}>
				<a
					href={item.href || '#'}
					className={`nav-link ${isShow ? 'active' : ''}`}
					onClick={handleClick}
				>
					{item.title}
				</a>
				{hasChildren && isShow && (
					<ul className={`dropdown-menu sub-menu show`}>
						{children.map((child, idx) => (
							<NavItemRenderer
								key={idx}
								item={child}
								level={level + 1}
								index={`${index}-${idx}`}
								onToggle={onToggle}
								activePath={activePath}
							/>
						))}
					</ul>
				)}
			</li>
		)
	}

	// Level 2+ (Vertical Dropdown)
	if (hasChildren) {
		return (
			<li className="dropdown" key={index}>
				<a
					href={item.href || '#'}
					className="dropdown-item dropdown-toggle d-flex justify-content-between align-items-center"
					onClick={handleClick}
				>
					<div className="d-flex align-items-center">
						{icon}
						<span>{item.title}</span>
					</div>
					{hasChildren && <span className="ms-auto ps-2">›</span>}
				</a>
				<ul className={`dropdown-menu sub-menu ${isShow ? 'show' : ''}`}>
					{children.map((child, idx) => (
						<NavItemRenderer
							key={idx}
							item={child}
							level={level + 1}
							index={`${index}-${idx}`}
							onToggle={onToggle}
							activePath={activePath}
						/>
					))}
				</ul>
			</li>
		)
	}

	return (
		<li key={index}>
			<a className="dropdown-item" href={item.href || '#'}>
				{icon}
				<span>{item.title}</span>
			</a>
		</li>
	)
}

const Header = ({ nav, title: propTitle, $logo: propLogo, offices }) => {
	const { document, t, db } = useUI()
	const { activePath, handleToggle } = useHeaderNav([])
	const [showSearch, setShowSearch] = useState(false)
	const [showDuty, setShowDuty] = useState(false)
	const [dutyData, setDutyData] = useState(/** @type {any[]} */([]))
	const [navExpanded, setNavExpanded] = useState(false)
	const [langOpen, setLangOpen] = useState(false)
	const [signinOpen, setSigninOpen] = useState(false)
	const searchInputRef = useRef(/** @type {HTMLInputElement|null} */ (null))

	const navItems =
		(nav && nav !== true
			? nav.items || nav.children
			: document?.nav?.items || document?.nav?.children) || []
	const logoUrl =
		propLogo === false
			? false
			: (propLogo || document?.$logo || document?.logo)?.wide ||
				(propLogo || document?.$logo || document?.logo)?.square ||
				document?.logo ||
				'/img/logo-uk.svg'
	const title = propTitle || document?.title || 'Банк'

	useEffect(() => {
		if (offices === 'duty' && db) {
			db.fetch('/uk/duty')
				.then(setDutyData)
				.catch((err) => console.error('Duty fetch error:', err))
		}
	}, [offices, db])

	// Focus search input when modal opens
	useEffect(() => {
		if (showSearch && searchInputRef.current) {
			searchInputRef.current.focus()
		}
	}, [showSearch])

	// Close dropdowns on outside click
	useEffect(() => {
		const handleOutside = (e) => {
			if (!e.target.closest('.lang') && langOpen) setLangOpen(false)
			if (!e.target.closest('.signin') && signinOpen) setSigninOpen(false)
		}
		window.addEventListener('click', handleOutside)
		return () => window.removeEventListener('click', handleOutside)
	}, [langOpen, signinOpen])

	return (
		<header className="root sticky-top">
			<nav className="navbar navbar-expand-xl px-0">
				<div className="container">
					<a href="/" className="navbar-brand me-4 logo-brand">
						{logoUrl ? (
							<img src={logoUrl} height="55" className="d-inline-block align-top" alt={title} />
						) : (
							<span className="fs-4 fw-bold">{title}</span>
						)}
					</a>

					<div
						className={`collapse navbar-collapse ${navExpanded ? 'show' : ''}`}
						id="basic-navbar-nav"
					>
						<ul className="navbar-nav main-nav">
							{navItems.map((item, index) => (
								<NavItemRenderer
									key={index}
									item={item}
									index={index}
									activePath={activePath}
									onToggle={handleToggle}
								/>
							))}
						</ul>
					</div>

					{/* Right Nav Options */}
					<div className="d-flex align-items-center gap-2 gap-md-3 ms-auto right-nav">
						{/* 1. Hamburger */}
						<button
							className="navbar-toggler border-0 p-1"
							type="button"
							aria-controls="basic-navbar-nav"
							aria-expanded={navExpanded}
							aria-label="Toggle navigation"
							onClick={() => setNavExpanded((v) => !v)}
						>
							<span className="navbar-toggler-icon"></span>
						</button>

						{/* 2. Language */}
						<div className={`dropdown lang ${langOpen ? 'show' : ''}`}>
							<button
								className="btn btn-link p-0 border-0 text-decoration-none dropdown-toggle"
								type="button"
								onClick={(e) => {
									e.stopPropagation()
									setLangOpen((v) => !v)
								}}
							>
								<div
									className="lang-bubble shadow-sm"
									style={{
										width: '32px',
										height: '32px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										borderRadius: '50%',
										background: 'var(--bs-primary)',
										color: '#fff',
										fontSize: '0.8rem',
									}}
								>
									UK
								</div>
							</button>
							<ul
								className={`dropdown-menu dropdown-menu-end shadow border-0 ${langOpen ? 'show' : ''}`}
							>
								<li>
									<a className="dropdown-item active" href="#">
										Українська
									</a>
								</li>
								<li>
									<a className="dropdown-item" href="#">
										English
									</a>
								</li>
							</ul>
						</div>

						{/* 3. Search */}
						<button
							className="btn btn-link p-1 text-body search-btn"
							type="button"
							onClick={() => setShowSearch(true)}
						>
							{React.createElement(/** @type {any} */ (BsSearch), { size: 20 })}
						</button>

						{/* 4. Sign in */}
						<div className={`dropdown signin ${signinOpen ? 'show' : ''}`}>
							<button
								className="btn btn-outline-primary rounded-pill fw-bold border-2 btn-sm d-flex align-items-center dropdown-toggle"
								type="button"
								id="dropdown-signin"
								onClick={(e) => {
									e.stopPropagation()
									setSigninOpen((v) => !v)
								}}
							>
								{t('Вхід')}
							</button>
							<ul
								className={`dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 ${signinOpen ? 'show' : ''}`}
							>
								<li>
									<a className="dropdown-item py-2" href="https://ibank.ua/private">
										{t('Приватним особам')}
									</a>
								</li>
								<li>
									<a className="dropdown-item py-2" href="https://ibank.ua/business">
										{t('Бізнесу')}
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</nav>

			{/* Search Modal */}
			{showSearch && (
				<>
					<div className="modal-backdrop fade show" onClick={() => setShowSearch(false)}></div>
					<div
						className="modal d-block search-modal"
						tabIndex={-1}
						onClick={() => setShowSearch(false)}
					>
						<div
							className="modal-dialog modal-lg modal-dialog-centered"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="modal-content">
								<div className="modal-body p-4 bg-body rounded-3">
									<div className="d-flex align-items-center justify-content-between mb-4">
										<h4 className="mb-0 fw-bold">{t('Пошук')}</h4>
										<button
											type="button"
											className="btn-close"
											aria-label="Close"
											onClick={() => setShowSearch(false)}
										></button>
									</div>
									<form className="position-relative" onSubmit={(e) => e.preventDefault()}>
										<input
											ref={searchInputRef}
											type="search"
											className="form-control form-control-lg border-2 border-primary rounded-pill ps-4 pe-5"
											placeholder={t('Що ви шукаєте?')}
											autoFocus
										/>
										<button
											type="submit"
											className="btn btn-primary position-absolute end-0 top-0 bottom-0 px-4 rounded-pill m-1"
											style={{ zIndex: 5 }}
										>
											{t('Шукати')}
										</button>
									</form>
								</div>
							</div>
						</div>
					</div>
				</>
			)}

			{/* Duty Modal */}
			{showDuty && (
				<>
					<div className="modal-backdrop fade show" onClick={() => setShowDuty(false)}></div>
					<div className="modal d-block" tabIndex={-1} onClick={() => setShowDuty(false)}>
						<div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
							<div className="modal-content">
								<div className="modal-header border-0 pb-0">
									<h5 className="modal-title fw-bold">{t('Duty Branches')}</h5>
									<button
										type="button"
										className="btn-close"
										onClick={() => setShowDuty(false)}
									></button>
								</div>
								<div className="modal-body">
									<div className="container">
										<div className="row g-3">
											{dutyData.map((item, idx) => (
												<div className="col-md-4" key={idx}>
													<div className="card h-100 p-3 shadow-sm border-0 bg-body-secondary">
														<h5 className="fw-bold text-primary">{item.title}</h5>
														<p className="small mb-1">{item.address}</p>
														<p className="small text-muted mb-2">{item.city}</p>
														<div className="mt-auto border-top pt-2">
															{item.phones?.map((p, i) => (
																<div key={i} className="small text-body">
																	📞 {p}
																</div>
															))}
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</header>
	)
}

export default Header
