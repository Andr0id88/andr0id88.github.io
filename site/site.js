// The CV content and expandable case studies work without JavaScript.
// Only the integration diagram uses scripting for its keyboard-accessible tabs.
document.querySelector('.map-tabs').hidden = false;
const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab, focus = false) {
  for (const item of tabs) {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  }
  if (focus) tab.focus();
}
for (const tab of tabs) {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    const index = tabs.indexOf(tab);
    const target = {ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1}[event.key];
    if (target === undefined) return;
    event.preventDefault();
    activateTab(tabs[target], true);
  });
}

// Reveal the relevant case study before following its media link.
function revealCaseStudy() {
  const target = document.getElementById(location.hash.slice(1));
  const details = target?.closest('details');
  if (!details) return;
  details.open = true;
  requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
}
for (const link of document.querySelectorAll('[data-open-case]')) {
  link.addEventListener('click', () => {
    const target = document.querySelector(link.getAttribute('href'));
    target.closest('details').open = true;
  });
}
addEventListener('hashchange', revealCaseStudy);
revealCaseStudy();
