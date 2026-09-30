// lisnoti.com/code/: Lisnoti Code against a monospaced font, with syntax colours, an editable
// left-hand box, measured widths and the WebKit check. Uses $, $$ and press from site.js.

'use strict';

// ---- Lisnoti Code's spacing rule in WebKit ----

// Lisnoti Code narrows a single space between words with `calt`. WebKit cannot run that rule
// safely, and Lisnoti Code's stylesheet switches it off there. Measure a single space: if it
// has not been narrowed, or the browser is Apple's engine, say why.
(async function webkitCheck() {
	const probe = document.createElement('span');
	probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font:100px 'Lisnoti Code'";
	document.body.appendChild(probe);
	try {
		await document.fonts.load("100px 'Lisnoti Code'", 'a a');
	} catch (e) { /* measure whatever loaded */ }
	probe.textContent = 'aa';
	const joined = probe.getBoundingClientRect().width;
	probe.textContent = 'a a';
	const spaced = probe.getBoundingClientRect().width;
	probe.remove();
	const space = spaced - joined;                 // about 26 px when the rule works
	const apple = /^Apple/.test(navigator.vendor || '');
	if (space > 32 || apple) $('#webkit-note').hidden = false;
})();

// ---- Examples ----

// None of these lines things up with runs of spaces: that only works in a monospaced font.
const EXAMPLES = {
	javascript:
`// Total the open orders for each customer
const openTotals = (orders) => {
  const totals = new Map();
  for (const order of orders) {
    if (order.status !== "open" || order.items.length === 0) continue;
    const net = order.amount - order.discount;
    if (net <= 0) continue;
    totals.set(order.customer, (totals.get(order.customer) ?? 0) + net);
  }
  return totals;
};

// The three largest totals, biggest first
const largest = [...openTotals(orders)]
  .filter(([id, total]) => total != null)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3);`,

	python:
`def moving_average(values: list[float], window: int = 3) -> list[float]:

    if window <= 0:
        raise ValueError("window must be positive")
    averages = []
    for i, value in enumerate(values):
        start = max(0, i - window + 1)
        chunk = values[start:i + 1]
        averages.append(sum(chunk) / len(chunk))
    return averages


readings = [12.1, 12.4, 11.9, 13.0, 12.7]
if readings != sorted(readings):
    print(moving_average(readings))`,

	r:
`# Crude death rates by five-year age band
rates <- function(lives, band_width = 5) {
  lives |>
    subset(exposure > 0 & age <= 100) |>
    transform(band = band_width * (age %/% band_width)) |>
    aggregate(cbind(deaths, exposure) ~ band, data = _, FUN = sum) |>
    transform(rate = deaths / exposure)
}

result <- rates(lives)
if (nrow(result) != 0) {
  result$excess <- result$rate - mean(result$rate)
  plot(result$band, log(result$rate), type = "b",
    xlab = "Age band", ylab = "Log death rate")
}`,

	cpp:
`#include <algorithm>
#include <vector>

// Drop readings outside a tolerance; return how many went
std::size_t clip(
    std::vector<double>& readings, double low, double high) {
    auto out = [low, high](double x) -> bool {
        return x < low || x > high;
    };
    auto first = std::remove_if(readings.begin(), readings.end(), out);
    auto dropped = static_cast<std::size_t>(readings.end() - first);
    readings.erase(first, readings.end());
    return dropped;
}

int main() {
    std::vector<double> xs{0.3, 1.7, -0.2, 0.9};
    for (auto it = xs.begin(); it != xs.end(); ++it) {
        if (*it <= 0.0) *it = 0.0;
    }
    return clip(xs, 0.0, 1.0) != 0 ? 1 : 0;
}`,

	csharp:
`using System.Collections.Generic;
using System.Linq;

public record Policy(string Id, int Age, decimal Premium, bool Lapsed);

public record Portfolio(IEnumerable<Policy> Policies)
{
    // Average premium for in-force policies in an age range
    public decimal AveragePremium(int start, int end) =>
        Policies
            .Where(p => !p.Lapsed && p.Age >= start && p.Age < end)
            .Select(p => p.Premium)
            .DefaultIfEmpty(0m)
            .Average();
}`,

	julia:
`# Newton's method, written the way it looks on paper
function newton(f, f′, x₀; tolerance = 1e-12, maxiter = 50)
    x = x₀
    for _ ∈ 1:maxiter
        Δx = f(x) / f′(x)
        x -= Δx
        (abs ∘ f)(x) <= tolerance && return x
    end
    error("Newton's method did not converge in $maxiter steps")
end

# |> passes a value forwards; define <| to pass it back
(<|)(f, x) = f(x)

newton(x -> x^2 - 2, x -> 2x, 1.0) |> println  # √2
println <| newton(cos, x -> -sin(x), 1.0)  # π/2`,

	tree:
`survival-model/
├── README.md
├── data/
│   ├── deaths-by-age-and-calendar-year-england-and-wales.csv
│   └── exposure.csv
├── src/
│   ├── fit.jl
│   ├── plots.jl
│   └── tables/
│       └── base-table.jl
└── test/
    └── runtests.jl`,
};

// ---- A small syntax highlighter ----

// Enough for the examples and for anything typed in the same language: comments, strings,
// numbers, keywords, types and function names. Operators are left uncoloured, so every ligature's
// characters stay together in one run of text.
const LANGS = {
	javascript: {
		line: '//', block: ['/*', '*/'], strings: ['`', '"', "'"],
		keywords: 'async await break case catch class const continue default delete do else export extends false finally for from function if import in instanceof let new null of return static super switch this throw true try typeof undefined var void while yield',
	},
	python: {
		line: '#', strings: ['"""', "'''", '"', "'"],
		keywords: 'and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield',
		types: 'int float',
	},
	r: {
		line: '#', strings: ['"', "'"],
		keywords: 'break else FALSE for function if in Inf library NA NaN next NULL repeat require return TRUE while',
	},
	cpp: {
		line: '//', block: ['/*', '*/'], strings: ['"', "'"], preprocessor: true,
		keywords: 'auto bool break case catch char class const constexpr continue default delete do double else enum explicit false float for if inline int long namespace new nullptr operator private protected public return short signed sizeof static static_cast std struct switch template this throw true try typename union unsigned using virtual void while',
	},
	csharp: {
		line: '//', block: ['/*', '*/'], strings: ['"', "'"], prefixes: '$@',
		keywords: 'abstract as async await base bool break case catch class const continue decimal default do double else enum false finally for foreach if in int interface internal is namespace new null object out override private protected public readonly record ref return sealed static string struct switch this throw true try using var virtual void while',
		// Library types, plus any type the code itself declares (see typeNames).
		types: 'Action DateTime Dictionary Exception Func HashSet ICollection IDictionary IEnumerable IList IQueryable IReadOnlyList KeyValuePair List Span Task TimeSpan',
		declares: /\b(?:class|record|struct|interface|enum)\s+([A-Z]\w*)/g,
	},
	julia: {
		line: '#', block: ['#=', '=#'], strings: ['"""', '"'],
		keywords: 'abstract begin break const continue do else elseif end export false for function global if import in let local macro module mutable nothing quote return struct true try using while',
	},
};
for (const lang of Object.values(LANGS)) {
	lang.keywords = new Set(lang.keywords.split(' '));
	lang.types = new Set(lang.types ? lang.types.split(' ') : []);
}

// Type names for a piece of code: the language's library types and the types it declares.
function typeNames(text, L) {
	const names = new Set(L.types);
	if (L.declares) for (const m of text.matchAll(L.declares)) names.add(m[1]);
	return names;
}

const NUMBER = /0x[\da-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?[mMfFdDlL]?/y;
const WORD = /[\p{L}_][\p{L}\p{N}_′]*/uy;

function tokens(text, langName) {
	const L = LANGS[langName];
	const out = [];
	const push = (cls, s) => {
		const last = out[out.length - 1];
		if (!cls && last && !last[0]) last[1] += s;
		else out.push([cls, s]);
	};
	if (!L) return [['', text]];
	const types = typeNames(text, L);
	let i = 0;
	const n = text.length;
	while (i < n) {
		const lineStart = i === 0 || text[i - 1] === '\n';
		let end = -1, cls = '';
		if (L.block && text.startsWith(L.block[0], i)) {
			const j = text.indexOf(L.block[1], i + L.block[0].length);
			end = j < 0 ? n : j + L.block[1].length;
			cls = 'com';
		} else if (text.startsWith(L.line, i)) {
			const j = text.indexOf('\n', i);
			end = j < 0 ? n : j;
			cls = 'com';
		} else if (L.preprocessor && lineStart && text[i] === '#') {
			const j = text.indexOf('\n', i);
			end = j < 0 ? n : j;
			cls = 'kw';
		} else {
			const start = L.prefixes && L.prefixes.includes(text[i]) && '"\''.includes(text[i + 1]) ? i + 1 : i;
			const quote = L.strings.find(q => text.startsWith(q, start));
			if (quote) {
				let j = start + quote.length;
				while (j < n) {
					if (text[j] === '\\') { j += 2; continue; }
					if (text.startsWith(quote, j)) { j += quote.length; break; }
					if (quote.length === 1 && quote !== '`' && text[j] === '\n') break;
					j++;
				}
				end = Math.min(j, n);
				cls = 'str';
			}
		}
		if (end < 0) {
			const before = text[i - 1] || ' ';
			NUMBER.lastIndex = i;
			WORD.lastIndex = i;
			let m;
			if (!/[\p{L}\p{N}_]/u.test(before) && (m = NUMBER.exec(text))) {
				end = i + m[0].length;
				cls = 'num';
			} else if (!/[\p{L}\p{N}_]/u.test(before) && (m = WORD.exec(text))) {
				end = i + m[0].length;
				cls = L.keywords.has(m[0]) ? 'kw' : types.has(m[0]) ? 'type' : text[end] === '(' ? 'fn' : '';
			} else {
				end = i + 1;
			}
		}
		push(cls, text.slice(i, end));
		i = end;
	}
	return out;
}

const escape = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// Highlighted HTML with each line in its own span, so its width can be measured.
function render(text, langName) {
	const lines = [[]];
	for (const [cls, s] of tokens(text, langName)) {
		s.split('\n').forEach((part, k) => {
			if (k > 0) lines.push([]);
			if (part) lines[lines.length - 1].push([cls, part]);
		});
	}
	return lines.map(line => '<span class="ln">' + line.map(([cls, s]) =>
		cls ? `<span class="${cls}">${escape(s)}</span>` : escape(s)).join('') + '</span>').join('\n');
}

// ---- The comparison ----

(function compare() {
	const right = {
		jetbrains: { name: 'JetBrains Mono', family: "'Compare JetBrains Mono'", ligaturesOff: 'none' },
		fira: { name: 'Fira Code', family: "'Compare Fira Code'", ligaturesOff: 'none' },
		cascadia: { name: 'Cascadia Code', family: "'Compare Cascadia Code'", ligaturesOff: 'none' },
		// Monaspace's code ligatures are in stylistic sets ss01 to ss10, which are off unless
		// asked for, so they are switched on with the ligatures. Its calt is texture healing,
		// which stays on either way.
		monaspace: { name: 'Monaspace Neon', family: "'Compare Monaspace Neon'", ligaturesOff: 'no-common-ligatures',
			ligaturesOn: '"ss01", "ss02", "ss03", "ss04", "ss05", "ss06", "ss07", "ss08", "ss09", "ss10"' },
		// Victor Mono's ligatures are in calt, like JetBrains Mono's.
		victor: { name: 'Victor Mono', family: "'Compare Victor Mono'", ligaturesOff: 'none' },
		// JuliaMono's arrows and pipes are in calt, like JetBrains Mono's. It covers over 11,000
		// characters, so its files are about a megabyte each and take a while on a slow line.
		juliamono: { name: 'JuliaMono', family: "'Compare JuliaMono'", ligaturesOff: 'none',
			loading: 'Its files are large because it covers so many characters.' },
		system: { name: 'your monospace font', family: 'monospace, monospace', ligaturesOff: 'none' },
	};

	const input = $('#left-input');
	const leftHl = $('#left-hl');
	const rightHl = $('#right-hl');
	const state = { example: 'javascript', right: 'fira', ligatures: true };
	let latest = 0;
	let timer = 0;

	function applyLigatures() {
		// Lisnoti Code's ligatures are in liga; its spacing and hyphen are in calt and stay on.
		const left = state.ligatures ? 'normal' : 'no-common-ligatures';
		input.style.fontVariantLigatures = left;
		leftHl.style.fontVariantLigatures = left;
		const r = right[state.right];
		rightHl.style.fontVariantLigatures = state.ligatures ? 'normal' : r.ligaturesOff;
		rightHl.style.fontFeatureSettings = state.ligatures && r.ligaturesOn ? r.ligaturesOn : 'normal';
	}

	function paint() {
		const text = input.value;
		const lang = state.example;
		leftHl.innerHTML = render(text, lang) + (text.endsWith('\n') ? ' ' : '');
		rightHl.innerHTML = render(text, lang);
	}

	function widths(pane) {
		let longest = 0, total = 0, chars = 0;
		for (const span of $$('.ln', pane)) {
			const w = span.getBoundingClientRect().width;
			longest = Math.max(longest, w);
			total += w;
			chars += [...span.textContent].length;
		}
		return { longest, total, chars };
	}

	// Characters beyond ASCII that a font lacks. Each is drawn twice, falling back once to
	// Lisnoti and once to a serif font: if the font has the character, both drawings match.
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = 64;
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	function draw(font, ch) {
		ctx.clearRect(0, 0, 64, 64);
		ctx.font = font;
		ctx.fillText(ch, 8, 48);
		return ctx.getImageData(0, 0, 64, 64).data.join();
	}
	async function missing(family, text) {
		const chars = [...new Set([...text].filter(ch => ch.codePointAt(0) > 0x7e && !/\s/.test(ch)))];
		if (!chars.length) return [];
		try { await document.fonts.load('40px Lisnoti', chars.join('')); } catch (e) { /* draw anyway */ }
		return chars.filter(ch => draw(`40px ${family}, Lisnoti`, ch) !== draw(`40px ${family}, serif`, ch));
	}

	async function measure() {
		const run = ++latest;
		const text = input.value;
		const r = right[state.right];
		// Comments are italic, so each font's italic has to be loaded too, or the first
		// measurement after choosing a font sets the comments in a stand-in.
		const faces = ["'Lisnoti Code'"].concat(state.right === 'system' ? [] : [r.family]);
		try {
			await Promise.all(faces.flatMap(f => [
				document.fonts.load('14px ' + f, text),
				document.fonts.load('italic 14px ' + f, text),
			]));
		} catch (e) { /* measure with whatever loaded */ }
		if (run !== latest || rightHl.classList.contains('loading')) return;
		const a = widths(leftHl);
		const b = widths(rightHl);
		const verdict = $('#verdict');
		verdict.textContent = '';
		if (!a.total || !b.total) return;
		const strong = document.createElement('strong');
		const more = Math.round((b.total / a.total - 1) * 100);
		if (more > 0) {
			strong.textContent = `${more}% more text`;
			verdict.append('Lisnoti Code fits ', strong, ` than ${r.name}.`);
		} else if (more < 0) {
			strong.textContent = `${Math.round((a.total / b.total - 1) * 100)}% more text`;
			verdict.append(`${r.name[0].toUpperCase() + r.name.slice(1)} fits `, strong, ' than Lisnoti Code.');
		} else {
			verdict.append(`Lisnoti Code and ${r.name} fit the same amount of text.`);
		}
		// The visitor's own monospace is a generic name, which cannot be tested this way.
		const lacking = state.right === 'system' ? [] : await missing(r.family, text);
		if (run !== latest) return;
		markBorrowed(lacking);
		if (lacking.length) {
			const list = document.createElement('strong');
			list.textContent = lacking.join(' ');
			const note = document.createElement('span');
			note.className = 'verdict-note';
			const one = lacking.length === 1;
			note.append(`${r.name} has no `, list, `. ${one ? 'It is' : 'They are'} outlined in the example: your browser borrowed ${one ? 'it' : 'them'} from another font.`);
			verdict.append(note);
		}
	}

	// Outline, in the right-hand pane, each character its font lacks. Marks from the last font
	// are cleared first, since changing font measures again without repainting. An outline
	// takes no room, so the widths already measured stand.
	function markBorrowed(chars) {
		for (const old of $$('.borrowed', rightHl)) old.replaceWith(old.textContent);
		rightHl.normalize();
		if (!chars.length) return;
		const wanted = new Set(chars);
		const walker = document.createTreeWalker(rightHl, NodeFilter.SHOW_TEXT);
		const nodes = [];
		while (walker.nextNode()) nodes.push(walker.currentNode);
		for (const node of nodes) {
			const parts = [...node.data];
			if (!parts.some(ch => wanted.has(ch))) continue;
			const frag = document.createDocumentFragment();
			let run = '';
			for (const ch of parts) {
				if (!wanted.has(ch)) { run += ch; continue; }
				if (run) frag.append(run);
				run = '';
				const mark = document.createElement('span');
				mark.className = 'borrowed';
				mark.textContent = ch;
				frag.append(mark);
			}
			if (run) frag.append(run);
			node.replaceWith(frag);
		}
	}

	function update() {
		paint();
		measure();
	}

	function load(example) {
		state.example = example;
		$('.compare').classList.toggle('tight', example === 'tree');
		input.value = EXAMPLES[example];
		input.scrollTop = input.scrollLeft = 0;
		update();
	}

	input.addEventListener('input', () => {
		paint();
		clearTimeout(timer);
		timer = setTimeout(measure, 150);
	});
	input.addEventListener('scroll', () => {
		leftHl.scrollTop = input.scrollTop;
		leftHl.scrollLeft = input.scrollLeft;
	});
	// Tab indents rather than leaving the box.
	input.addEventListener('keydown', e => {
		if (e.key !== 'Tab' || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
		e.preventDefault();
		input.setRangeText('    ', input.selectionStart, input.selectionEnd, 'end');
		input.dispatchEvent(new Event('input'));
	});

	const exampleChips = $$('[data-example]');
	// Choosing a different example replaces the code; choosing the one already chosen does
	// nothing, on every platform, as a dropdown does on phones.
	exampleChips.forEach(c => c.addEventListener('click', () => {
		if (c.getAttribute('aria-pressed') === 'true') return;
		press(exampleChips, c);
		load(c.dataset.example);
	}));

	const rightChips = $$('[data-right]');
	rightChips.forEach(c => c.addEventListener('click', () => {
		press(rightChips, c);
		useRight(c.dataset.right, c.textContent);
	}));

	// A comparison font is applied only once its files have arrived. Until then the pane says
	// it is loading, instead of showing the browser's default serif, and the verdict waits.
	let fontRun = 0;
	async function useRight(name, label) {
		const run = ++fontRun;
		const r = right[name];
		$('#right-label').textContent = label;
		if (name !== 'system') {
			rightHl.dataset.loading = `Loading ${label}…` + (r.loading ? ` ${r.loading}` : '');
			rightHl.classList.add('loading');
			$('#verdict').textContent = '';
			try {
				await Promise.all([
					document.fonts.load('14px ' + r.family, input.value || 'a'),
					document.fonts.load('italic 14px ' + r.family, input.value || 'a'),
				]);
			} catch (e) { /* show whatever loaded */ }
			if (run !== fontRun) return;
		}
		rightHl.classList.remove('loading');
		state.right = name;
		rightHl.style.fontFamily = r.family;
		applyLigatures();
		measure();
	}

	const ligaButton = $('#liga-button');
	ligaButton.addEventListener('click', () => {
		state.ligatures = !state.ligatures;
		ligaButton.setAttribute('aria-pressed', String(state.ligatures));
		$('.liga-mark', ligaButton).textContent = state.ligatures ? '✔' : '✗';
		applyLigatures();
		measure();
	});

	applyLigatures();
	load(state.example);
	useRight(state.right, $('[data-right][aria-pressed="true"]').textContent);
})();
