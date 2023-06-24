export const btnStyles = {
	'.btn:not([hidden])': {
		appearance: 'button',
		display: 'inline-block',
		padding: 'var(--button-padding, 0.3em)',
		'font-family': 'var(--button-font, inherit)',
		'border-radius': 'var(--button-border-radius, initial)',
		'box-sizing': 'border-box',
	},

	'.btn.round': {
		'border-radius': '50%',
	},

	'.btn.rounded, .btn.outline.rounded': {
		'border-radius': 'var(--button-rounded-border-radius, 2em)',
	},

	':disabled, .disabled, [disabled], ._state--disabled': {
		cursor: 'not-allowed',
		'pointer-events': 'none',
	},

	'.btn:disabled, .btn.disabled, .btn._state--disabled': {
		'box-shadow': '0 0 0.3rem var(--shadow-color, rgba(0,0,0,0.4)) inset',
		'border': 'var(--button-disabled-border, var(--button-border, 0.2rem inset black))',
	},

	'.btn:focus, summary:focus, input:focus, select:focus, textarea:focus, .input:focus, [tabindex]:focus, a:focus': {
		'outline-width': 'var(--focus-outline-width, thin)',
		'outline-style': 'var(--focus-outline-style, dotted)',
		'outline-color': 'var(--focus-outline-color, currentColor)',
		'outline-offset': 'var(--focus-outline-offset, 0)',
	},

	'.btn.btn-primary': {
		'background-color': 'var(--button-primary-background)',
		border: 'var(--button-primary-border)',
		color: 'var(--button-primary-color)',
	},

	'.btn.btn-primary:hover': {
		'background-color': 'var(--button-primary-hover-background, var(--button-primary-active-background, var(--button-primary-background)))',
		border: 'var(--button-primary-hover-border, var(--button-primary-active-border, var(--button-primary-border))))',
		color: 'var(--button-primary-hover-color, var(--button-primary-active-color, var(--button-primary-color))))',
	},

	'.btn.btn-primary:active, .btn.btn-primary.active': {
		'background-color': 'var(--button-primary-active-background, var(--button-primary-background))',
		border: 'var(--button-primary-active-border, var(--button-primary-border))',
		color: 'var(--button-primary-active-color)',
	},

	'.btn.btn-default': {
		'background-color': 'var(--button-default-background, #DFDFDF)',
		border: 'var(--button-default-border, initial)',
		color: 'var(--button-default-color, #585858)',
	},

	'.btn.btn-default:hover': {
		'background-color': 'var(--button-default-hover-background, var(--button-default-active-background, #CDCDCD))',
		border: 'var(--button-default-hover-border, var(--button-default-active-border, initial))',
		color: 'var(--button-default-hover-color, var(----button-default-active-color, #585858))',
	},

	'.btn.btn-default:active, .btn.btn-default.active': {
		'background-color': 'var(--button-default-active-background, #CDCDCD)',
		border: 'var(--button-default-active-border)',
		color: 'var(--button-default-active-color, #585858)',
	},

	'.btn.btn-accept': {
		'background-color': 'var(--button-accept-background, var(--button-primary-background))',
		border: 'var(--button-accept-active-border, var(--button-primary-border))',
		color: 'var(--button-accept-color, var(--button-primary-color))',
	},

	'.btn.btn-accept:hover': {
		'background-color': 'var(--button-accept-hover-background, var(--button-accept-active-background, var(--button-primary-hover-background, var(--button-primary-active-background))))',
		color: 'var(--button-accept-hover-color, var(--button-accept-active-color, var(--button-primary-hover-color, var(--button-primary-active-color, var(--button-primary-color)))))',
		border: 'var(--button-accept-hover-border, var(--button-accept-active-border, var(--button-primary-hover-border, var(--button-primary-active-border, var(--button-primary-border)))))',
	},

	'.btn.btn-accept:disabled, .btn.btn-accept._state--disabled, .btn.btn-accept.disabled': {
		'background-color': 'var(--button-accept-disabled-background, var(--button-accept-background, var(--button-disabled-background, var(--button-background,))))',
		border: 'var(--button-accept-disabled-border, var(--button-accept-border, var(--button-disabled-border)))',
		color: 'var(--button-accept-disabled-color, var(--button--accept-color, var(--button-disabled-color)))',
	},

	'.btn.btn-accept:active, .btn.btn-accept.active': {
		'background-color': 'var(--button-accept-active-background, var(--button-accept-background))',
		border: 'var(--button-accept-active-border, var(--button-accept-border, var(--button-primary-active-border)))',
		color: 'var(--button-accept-active-color, var(--button--accept-color, var(--button-active-color)))',
	},

	'.btn.btn-reject': {
		'background-color': 'var(--button-reject-background, var(--button-primary-background))',
		'border': 'var(--button-reject-border, var(--button-primary-border))',
		'color': 'var(--button-reject-color, var(--button-primary-color))',
	},

	'.btn.btn-reject:hover': {
		'background-color': 'var(--button-reject-hover-background, var(--button-reject-active-background, var(--button-primary-hover-background, var(--button-primary-active-background))))',
		border: 'var(--button-reject-hover-border, var(--button-reject-active-border, var(--button-primary-hover-border, var(--button-primary-active-border, var(--button-primary-border)))))',
		color: 'var(--button-reject-hover-color, var(--button-reject-active-color, var(--button-primary-hover-color, var(--button-primary-active-color, var(--button-primary-color)))))',
	},

	'.btn.btn-reject:disabled, .btn.btn-reject._state--disabled, .btn.btn-reject.disabled, .btn.btn-reject[disabled]': {
		'background-color': 'var(--button-reject-disabled-background, var(--button-reject-background, var(--button-disabled-background, var(--button-background))))',
		border: 'var(--button-reject-disabled-border, var(--button-reject-border, var(--button-disabled-border)))',
		color: 'var(--button-reject-disabled-color, var(--button--reject-color, var(--button-disabled-color)))',
	},

	'.btn.btn-reject:active, .btn.btn-reject.active': {
		'background-color': 'var(--button-reject-active-background, var(--button-reject-background))',
		border: 'var(--button-reject-active-border, var(--button-reject-border, var(--button-primary-active-border)))',
		color: 'var(--button-reject-active-color, var(--button--reject-color, var(--button-active-color)))',
	},

	'.btn.btn-outline': {
		color: 'var(--button-outline-color, var(--accent-color, #007bff))',
		'background-color': 'var(--button-outline-background, transparent)',
		border: 'var(--button-outline-border, 2px solid currentColor)',
		'border-radius': 'var(--button-outline-border-radius, 12px)',
	},

	'.btn.btn-outline.accent': {
		color: 'var(--button-outline-color, var(--accent-color, #007bff))',
	},

	'.btn.btn-outline.current-color': {
		color: 'inherit',
	},

	'.btn.btn-outline.primary': {
		color: 'var(--button-primary-background)',
	},

	'.btn.btn-outline.accept': {
		color: 'var(--button-accept-background)',
	},

	'.btn.btn-outline.reject': {
		color: 'var(--button-reject-background)',
	},
};
