//----------------------------------------------------------------------------------------------
//--------------------------------------Получения cookie----------------------------------------
//----------------------------------------------------------------------------------------------
function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

//----------------------------------------------------------------------------------------------
//--------------------------------------Сохранение cookie---------------------------------------
//----------------------------------------------------------------------------------------------
function setCookie(name, value) {
	let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
	document.cookie = updatedCookie;
}

//----------------------------------------------------------------------------------------------
//-----------------------------*---------Удаление cookie-------------*--------------------------
//----------------------------------------------------------------------------------------------
function deleteCookie(cookie_name) {
	let cookie_date = new Date(); // Текущая дата и время
	cookie_date.setTime(cookie_date.getTime() - 1);
	document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
}

//----------------------------------------------------------------------------------------------
//--------------------------Получения параметров get из url-------------------------------------
//----------------------------------------------------------------------------------------------
function $_GET(key) {
	var p = window.location.search;
	p = p.match(new RegExp(key + '=([^&=]+)'));
	return p ? p[1] : false;
}


//----------------------------------------------------------------------------------------------
//--------------------------------------Мгновенный поиск----------------------------------------
//----------------------------------------------------------------------------------------------

function search(searchQuery, parent) {
	//получение данных
	let query = '';
	for (let i = 0; i < searchQuery.length; i++) {
		query += '%u' + searchQuery.charCodeAt(i).toString(16);
	}
	let REQUEST_URL = 'https://cinema.ntop.tv/api.php?format=ajax&action[0]=Video.search&query[0]=' + query + '&JsHttpRequest=16007667792177-xml';
	let xhr = new XMLHttpRequest();
	xhr.open('POST', REQUEST_URL);
	xhr.responseType = 'json';
	xhr.send();

	// let searchForm = document.getElementById('search-form');

	//Создание div для вывода
	let fieldSearchResult = document.createElement('div');
	fieldSearchResult.id = 'field-search-result';
	fieldSearchResult.style.width = parent.offsetWidth + 'px'; //ширина задается в соответствии с родительским блоком

	parent.addEventListener('keypress', function (event) {
		console.log(event.keyCode);

	});

	parent.append(fieldSearchResult);

	let divFilm = document.createElement('div');
	let divPerson = document.createElement('div');

	fieldSearchResult.append(divFilm);
	fieldSearchResult.append(divPerson);
	fieldSearchResult.style.maxHeight = window.innerHeight * (9 / 10) + 'px';
	fieldSearchResult.style.overflowY = 'auto';

	xhr.onreadystatechange = function () {
		if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
			let searchResult = xhr.response;

			//Вывод фильмов
			let movies = searchResult['js'][0]['response']['movies'];

			if (movies.length > 0) {
				let counter = 0;

				for (let key in movies) {
					if (movies.length <= 0) {
						console.log('пусто');
					}
					if (counter >= 5) {
						break;
					}
					let cover = 'https://cinema.ntop.tv' + movies[key]['cover'];
					let name = movies[key]['name'];
					let international_name = movies[key]['international_name'];
					let year = movies[key]['year'];
					let link = 'movie-page.html?id=' + movies[key]['movie_id']; //добавление id фильма к ссылке

					let template = `<a href="${link}">
										<div class="row">
											<div class="col-2" style="paddig: 1em;">
												<img src="${cover}" alt=""/>
											</div>
											<div class="col-10 pt-2">
												<p class="h6"><b>${name}</b></p>
												<p class="h6">${international_name}<span> (${year})</span></p>
											</div>
										</div>
									</a>`;
					divFilm.innerHTML += template;
					counter++;
				}

				divFilm.innerHTML += `<a href=${'search_result.html?query=' + query}>
										<button>Больше результатов в категории "Фильмы"</button>
									</a>`;
				// divFilm.innerHTML += `<a href=${'search_result.html?query=' + query}>
				// 	<div style="border-bottom: 1px solid gray; padding: 0; margin: 0">
				// 		<div style="margin: 0.2em 20% 0.2em 20%; text-align: center; background-color: #35368C;">
				// 			<p style="color: #f8f9fa; margin: 0">Больше результатов в категории "Фильмы"</p>
				// 		</div>
				// 	</div>
				// </a>`;
			} else {
				console.log('пусто');
			}

			//Вывод актеров
			let persones = searchResult['js'][0]['response']['persones'];

			if (persones.length > 0) {
				let counter = 0;

				for (let key in persones) {
					if (counter >= 5) {
						break;
					}
					let photo = 'https://cinema.ntop.tv' + persones[key]['photo'];
					let name = persones[key]['name'];
					let link = 'person-page.html?id=' + persones[key]['person_id'];

					let template = `<a href="${link}" style="text-decoration: none;">
										<div class="row">
											<div class="col-2" style="paddig: 1em;">
												<img src="${photo}" alt=""/>
											</div>
											<div class="col-10 pt-2">
												<p class="h6"><b>${name}</b></p>
											</div>
										</div>
									</a>`;
					divPerson.innerHTML += template;
					counter++;
				}

				divPerson.innerHTML += `<a href=${'search_result.html?query=' + query}>
											<button>Больше результатов в категории "Актеры"</button>
										</a>`;

			}
		}
	}
}

//restartPlayer() - получает плеер на странице по указанному id плеера, задает разрешение для видео, указывает новый путь и перезапускает плеер
function restartPlayer(playerId, resolution, src) {
	resolution = resolution.split('x');
	src = src.replace('web', 'online');
	let player;

	while (true) {
		try {
			player = videojs.getPlayer(playerId);
			player.width = resolution[0];
			player.height = resolution[1];
			player.setAttribute('data-setup', '{ "aspectRatio":"' + resolution[0] + ':' + resolution[1] + '", "playbackRates": [1, 1.5, 2] }');
			player.src(src);
			player.load();
		} catch (e) {
			console.error(e);
			//continue;
		}
		break;
	}

}


//----------------------------------------------------------------------------------------------
//--------------------------Функции для работы с localStorage-----------------------------------
//----------------------------------------------------------------------------------------------

// Просмотренные фильмы добавляются в localStorage с ключом 'last'
// В localStorage добавлен счетчик 'pageQuantity' для количества страниц.
// Во время открытия вкладки счетчик увеличивается на единицу. А во время закрытия уменьшается на единицу
// Когда пользователь закрывает последнюю вкладку связанную с сайтом удаляется 'last' из localStorage, т.е. когда pageQuantity == 0

function pageOpen() {
	if (localStorage.getItem('pageQuantity')) {
		let num = Number(localStorage.getItem('pageQuantity'));
		num++;
		localStorage.setItem('pageQuantity', num);
		console.log('pagequantity onload = ' + num);
	} else {
		localStorage.setItem('pageQuantity', 1);
	}
}

function pageClose() {
	let pageQuantity = localStorage.getItem('pageQuantity');
	if (--pageQuantity < 0) {
		localStorage.removeItem('pageQuantity');
		localStorage.removeItem('last');
	} else {
		localStorage.setItem('pageQuantity', pageQuantity);
	}
}