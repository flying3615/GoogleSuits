//first time load
let inbox = document.querySelector('a[href="https://mail.google.com/mail/u/0/#inbox"]');
ipc.send('inbox_change', inbox.innerHTML);

// dom change, inboxdiv is dynamic ???
const inboxdiv = document.querySelector('#\\:y3');
let observer = new MutationObserver(mutations => {
	inbox = document.querySelector('a[href="https://mail.google.com/mail/u/0/#inbox"]');
	ipc.send('inbox_change', inbox.innerHTML)
});

observer.observe(inboxdiv, {
	attributes: true,
	characterData: true,
	childList: true,
	subtree: true,
	attributeOldValue: true,
	characterDataOldValue: true
});
