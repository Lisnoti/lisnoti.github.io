// lisnoti.com, shared by both pages: top bar, type tester, equations, glyph explorer and copy
// buttons. Each part runs only if its elements are on the page.

'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// On phones each group of option buttons marked data-menu shows as a dropdown instead. The two
// stay in step: choosing from the dropdown presses the button, and pressing a button (from any
// code) updates the dropdown.
const menus = new WeakMap();

function syncMenu(group) {
	const select = menus.get(group);
	if (!select) return;
	const i = $$('.chip', group).findIndex(c => c.getAttribute('aria-pressed') === 'true');
	if (i >= 0) select.selectedIndex = i;
}

function addMenu(group) {
	const wrap = document.createElement('label');
	wrap.className = 'chip-menu';
	if (group.dataset.menu) {
		const text = document.createElement('span');
		text.textContent = group.dataset.menu;
		wrap.appendChild(text);
	}
	const select = document.createElement('select');
	select.setAttribute('aria-label', group.getAttribute('aria-label') || group.dataset.menu || 'Choose');
	for (const chip of $$('.chip', group)) {
		const option = document.createElement('option');
		option.textContent = chip.textContent;
		select.appendChild(option);
	}
	select.addEventListener('change', () => {
		$$('.chip', group)[select.selectedIndex].click();
	});
	wrap.appendChild(select);
	group.after(wrap);
	group.classList.add('has-menu');
	menus.set(group, select);
	syncMenu(group);
}

// Mark one chip in a group as pressed.
function press(chips, chosen) {
	for (const c of chips) c.setAttribute('aria-pressed', String(c === chosen));
	if (chosen) syncMenu(chosen.parentElement);
}

$$('.chips[data-menu]').forEach(group => {
	if ($$('.chip', group).length) addMenu(group);
});

// ---- Top bar: highlight the section in view ----

(function topbar() {
	const links = new Map($$('.topbar nav a').map(a => [a.getAttribute('href').slice(1), a]));
	const sections = [...links.keys()].map(id => document.getElementById(id)).filter(Boolean);
	const observer = new IntersectionObserver(entries => {
		for (const e of entries) {
			if (e.isIntersecting) {
				for (const a of links.values()) a.classList.remove('current');
				links.get(e.target.id)?.classList.add('current');
			}
		}
	}, { rootMargin: '-40% 0px -55% 0px' });
	sections.forEach(s => observer.observe(s));
})();

// ---- Light and dark ----

// The top bar's theme button, as on naxp.org. Three states rather than two, so a reader who
// has pinned the page can put it back to following the system. The icon shows the state the
// page is in; what a press does is in the label and the tooltip. Applying a stored choice
// happens in the inline script in each page's head, before the first paint.
(function theme() {
	const button = $('#theme');
	if (!button) return;
	const KEY = 'lisnoti-theme';
	const STATES = ['auto', 'light', 'dark'];
	const ICONS = {
		// A circle half filled: neither one thing nor the other, which is the state.
		auto: '<circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.6"/>'
			+ '<path d="M8 1.8a6.2 6.2 0 0 1 0 12.4Z"/>',
		light: '<circle cx="8" cy="8" r="3.1"/>'
			+ '<path d="M8 0.4v2.1M8 13.5v2.1M0.4 8h2.1M13.5 8h2.1M2.6 2.6l1.5 1.5'
			+ 'M11.9 11.9l1.5 1.5M13.4 2.6l-1.5 1.5M4.1 11.9l-1.5 1.5" '
			+ 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
		dark: '<path d="M13.6 10.4A6.2 6.2 0 1 1 5.6 2.4 5.2 5.2 0 0 0 13.6 10.4Z"/>',
	};
	const ACTIONS = {
		auto: 'Switch to light mode',
		light: 'Switch to dark mode',
		dark: 'Switch to system preference',
	};

	const current = () => {
		const stamped = document.documentElement.dataset.theme;
		return STATES.includes(stamped) ? stamped : 'auto';
	};

	function apply(state) {
		if (state === 'auto') delete document.documentElement.dataset.theme;
		else document.documentElement.dataset.theme = state;
		try {
			if (state === 'auto') localStorage.removeItem(KEY);
			else localStorage.setItem(KEY, state);
		} catch (e) {
			// Without storage the reader loses the choice on the next page, nothing more.
		}
		button.innerHTML = `<svg viewBox="0 0 16 16" aria-hidden="true">${ICONS[state]}</svg>`;
		button.setAttribute('aria-label', ACTIONS[state]);
		button.title = ACTIONS[state];
	}

	apply(current());
	button.addEventListener('click', () => {
		apply(STATES[(STATES.indexOf(current()) + 1) % STATES.length]);
	});
})();

// ---- Type tester ----

(function tester() {
	const area = $('#tester-text');
	if (!area) return;
	const size = $('#tester-size');
	const sizeOut = $('#tester-size-out');
	const samples = {
		text: [
			'Il1 O0 · lI1| · rn m · cl d · 5S 2Z 8B',
			'',
			'Turning and turning in the widening gyre',
			'The falcon cannot hear the falconer;',
			'Things fall apart; the centre cannot hold;',
			'Mere anarchy is loosed upon the world,',
			'The blood-dimmed tide is loosed, and everywhere',
			'The ceremony of innocence is drowned;',
			'The best lack all conviction, while the worst',
			'Are full of passionate intensity.',
			'',
			'W. B. Yeats, ‘The Second Coming’ (1920)',
		].join('\n'),
		math: [
			'∀x ∈ ℝ: x² ≥ 0',
			'∑ᵢ₌₁ⁿ i = n(n + 1)/2',
			'E² = (pc)² + (mc²)²',
			't′ = t / √(1 − v²/c²)',
			'∮ E · dA = Q / ε₀',
			'äₓ = ∑ₜ vᵗ ₜpₓ',
		].join('\n\n'),
		greek: [
			'Σα βγεις στον πηγαιμό για την Ιθάκη,',
			'να εύχεσαι νάναι μακρύς ο δρόμος,',
			'γεμάτος περιπέτειες, γεμάτος γνώσεις.',
			'',
			'Κ. Π. Καβάφης, «Ιθάκη» (1911)',
		].join('\n'),
		cyrillic: [
			'Белеет парус одинокой',
			'В тумане моря голубом!..',
			'Что ищет он в стране далекой?',
			'Что кинул он в краю родном?..',
			'',
			'М. Ю. Лермонтов, «Парус» (1832)',
		].join('\n'),
		devanagari: [
			'कश्चित्कान्ताविरहगुरुणा स्वाधिकारात्प्रमत्तः',
			'शापेनास्तङ्गमितमहिमा वर्षभोग्येण भर्तुः ।',
			'यक्षश्चक्रे जनकतनयास्नानपुण्योदकेषु',
			'स्निग्धच्छायातरुषु वसतिं रामगिर्याश्रमेषु ॥ १.१ ॥',
			'',
			'कालिदास, ‘मेघदूतम्’',
		].join('\n'),
	};
	const styles = {
		regular: ['normal', '400'],
		italic: ['italic', '400'],
		bold: ['normal', '700'],
		bolditalic: ['italic', '700'],
	};
	// The box grows and shrinks with its text.
	const fit = () => {
		area.style.height = 'auto';
		area.style.height = area.scrollHeight + 'px';
	};

	area.value = samples.text;

	const styleChips = $$('[data-tester-style]');
	styleChips.forEach(c => c.addEventListener('click', () => {
		press(styleChips, c);
		const [style, weight] = styles[c.dataset.testerStyle];
		area.style.fontStyle = style;
		area.style.fontWeight = weight;
		fit();
	}));

	// Choosing a different sample replaces the text; choosing the one already chosen does
	// nothing, as a dropdown does on phones.
	const sampleChips = $$('[data-tester-sample]');
	sampleChips.forEach(c => c.addEventListener('click', () => {
		if (c.getAttribute('aria-pressed') === 'true') return;
		press(sampleChips, c);
		area.value = samples[c.dataset.testerSample];
		fit();
	}));
	area.addEventListener('input', fit);

	size.addEventListener('input', () => {
		area.style.fontSize = size.value + 'px';
		sizeOut.value = size.value + ' px';
		fit();
	});

	window.addEventListener('resize', fit);
	document.fonts.ready.then(fit);
	fit();
})();

// ---- Equations ----

window.addEventListener('DOMContentLoaded', function equations() {
	const grid = $('#equations');
	if (!grid) return;
	const list = [
		['Quadratic formula', String.raw`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`],
		['Gaussian integral', String.raw`\int_{-\infty}^{\infty} \! e^{-x^2}\,\mathrm{d}x = \sqrt{\pi}`],
		['Maxwell', String.raw`\nabla \times \mathbf{B} = \mu_0 \mathbf{J} + \mu_0 \varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}`],
		['Bayes', String.raw`\mathrm{P}(A \mid B) = \frac{\mathrm{P}(B \mid A)\,\mathrm{P}(A)}{\mathrm{P}(B)}`],
		['Limit', String.raw`\lim_{n \to \infty} \left( 1 + \frac{1}{n} \right)^{n} = e`],
		['Matrix', String.raw`\det \begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc`],
	];
	const hasTemml = typeof temml !== 'undefined';
	for (const [title, tex] of list) {
		const card = document.createElement('div');
		card.className = 'equation';
		card.innerHTML = '<h3></h3><div class="out"></div><pre class="src"></pre>';
		$('h3', card).textContent = title;
		$('.src', card).textContent = tex;
		if (hasTemml) {
			try {
				temml.render(tex, $('.out', card), { displayMode: true });
			} catch (e) {
				$('.out', card).textContent = e.message;
			}
		}
		grid.appendChild(card);
	}

	const input = $('#tex-input');
	const output = $('#tex-output');
	const error = $('#tex-error');
	const update = () => {
		if (!hasTemml) return;
		try {
			temml.render(input.value, output, { displayMode: true, throwOnError: true });
			error.textContent = '';
		} catch (e) {
			error.textContent = e.message;
		}
	};
	// The box grows and shrinks with its text, as the type tester's does. Its border is
	// outside scrollHeight, so it is added back.
	const fit = () => {
		input.style.height = 'auto';
		input.style.height = input.scrollHeight + input.offsetHeight - input.clientHeight + 'px';
	};
	input.addEventListener('input', () => { update(); fit(); });
	window.addEventListener('resize', fit);
	update();
	fit();
	// Measured again once Lisnoti Code has loaded, since it wraps differently from the fallback.
	document.fonts.ready.then(fit);
});

// ---- Glyph explorer ----

(function explorer() {
	const section = $('#glyphs');
	if (!section) return;
	const fontName = section.dataset.font === 'code' ? 'Lisnoti Code' : 'Lisnoti';
	const groupsEl = $('#glyph-groups');
	const grid = $('#glyph-grid');
	const big = $('#glyph-big');
	const nameEl = $('#glyph-name');
	const cpEl = $('#glyph-cp');
	let data = null;

	const hex = cp => 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
	const isMark = ch => /\p{M}/u.test(ch);
	const isBlank = ch => /[\p{Zs}\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(ch);

	function show(cp, name, button) {
		const ch = String.fromCodePoint(cp);
		big.textContent = isMark(ch) ? '◌' + ch : isBlank(ch) ? '' : ch;
		nameEl.textContent = name || 'No name in this Unicode data';
		cpEl.textContent = hex(cp);
		for (const b of $$('[aria-current="true"]', grid)) b.removeAttribute('aria-current');
		if (button) button.setAttribute('aria-current', 'true');
	}

	function openGroup(index) {
		const group = data.groups[index];
		press($$('.chip', groupsEl), groupsEl.children[index]);
		grid.textContent = '';
		const frag = document.createDocumentFragment();
		for (const [cp, name] of group.chars) {
			const ch = String.fromCodePoint(cp);
			const b = document.createElement('button');
			b.type = 'button';
			b.setAttribute('role', 'listitem');
			b.setAttribute('aria-label', (name || hex(cp)) + ', ' + hex(cp));
			if (isBlank(ch)) {
				b.textContent = cp.toString(16).toUpperCase();
				b.style.fontSize = 'var(--fs-label)';
			} else {
				b.textContent = isMark(ch) ? '◌' + ch : ch;
			}
			const pick = () => show(cp, name, b);
			b.addEventListener('mouseenter', pick);
			b.addEventListener('focus', pick);
			b.addEventListener('click', pick);
			frag.appendChild(b);
		}
		grid.appendChild(frag);
		grid.scrollTop = 0;
		const first = group.chars.find(([cp]) => !isBlank(String.fromCodePoint(cp))) || group.chars[0];
		show(first[0], first[1], null);
	}

	async function load() {
		const response = await fetch('/assets/glyphs.json');
		data = await response.json();
		const total = data.groups.reduce((n, g) => n + g.chars.length, 0);
		$('#glyph-count').textContent =
			`${fontName} has ${total.toLocaleString('en-GB')} characters. Pick a group, then point at or tap a character.`;
		data.groups.forEach((g, i) => {
			const c = document.createElement('button');
			c.type = 'button';
			c.className = 'chip';
			c.textContent = g.name;
			c.setAttribute('aria-pressed', 'false');
			c.addEventListener('click', () => openGroup(i));
			groupsEl.appendChild(c);
		});
		addMenu(groupsEl);
		openGroup(0);
	}

	// Fetch the character list only when the section comes near.
	const observer = new IntersectionObserver(entries => {
		if (entries.some(e => e.isIntersecting)) {
			observer.disconnect();
			load().catch(() => {
				$('#glyph-count').textContent = 'The character list could not be loaded.';
			});
		}
	}, { rootMargin: '600px 0px' });
	observer.observe(section);
})();

// ---- Copy buttons ----

for (const button of $$('.copy')) {
	button.addEventListener('click', async () => {
		const code = $('code', button.parentElement);
		let copied = false;
		try {
			await navigator.clipboard.writeText(code.textContent);
			copied = true;
		} catch (e) {
			// No clipboard API, as on a plain http page: select the text and use the older
			// copy command. If that fails too, the text is left selected to copy by hand.
			const range = document.createRange();
			range.selectNodeContents(code);
			const selection = getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
			try { copied = document.execCommand('copy'); } catch (e2) { copied = false; }
			if (copied) selection.removeAllRanges();
		}
		button.textContent = copied ? 'Copied' : 'Selected';
		setTimeout(() => { button.textContent = 'Copy'; }, 2000);
	});
}
