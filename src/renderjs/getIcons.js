const icons = Array.from(document.querySelectorAll("ul.gb_ia.gb_ba li"))
	.reduce((all, item) => {
		return [
			...all,
			{[item.id]: item.getElementsByClassName('gb_3')[0].innerHTML}
		]
	}, [])
// console.log(icons)
ipc.send('menu_icons', icons)