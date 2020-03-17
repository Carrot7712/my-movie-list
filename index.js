/**********************手刻作業說明*************************
//HTML:
新增切換icon:#barIcon和#cardIcon，並用div#modeIcon包住
//CSS:
一些美化
//JavaScript:
-新增變數:
modeIcon
displayMode
-修改變數:
提前宣告pageData，讓各函式都可取用
-新增函數:
 modeIcon監聽器，監聽哪個模式的按鈕被點擊>修改displayMode變數>渲染畫面成指定樣式
 cardHtml:製造card樣式
 listHtml:製造list樣式
-修改函數:
displayDataList改名為displayData，並加入display mode判斷條件
***********************************************************/
;(function() {
  //取資料
  const BASE_URL = "https://movie-list.alphacamp.io/"
  const INDEX_URL = BASE_URL + "api/v1/movies/"
  const POSTER_URL = BASE_URL + "posters/"
  //存放API近來的資料
  const data = []
  //存放計算後當前頁面要顯示的資料，為了要到處可用，先宣告
  let pageData = []

  //找到元件
  const dataPanel = document.getElementById("data-panel")
  const searchForm = document.getElementById("search")
  const searchInput = document.getElementById("search-input")
  const pagination = document.getElementById("pagination")
  const modeIcon = document.getElementById("modeIcon")

  //分頁準備
  const ITEM_PER_PAGE = 12
  let paginationData = []

  //紀錄當前顯示模式
  let displayMode = "card"

  //透過API取得電影資料
  axios
    .get(INDEX_URL)
    .then(response => {
      data.push(...response.data.results) //從API拿到資料後塞進data陣列
      getTotalPages(data) //顯示總頁數
      getPageData(1, data) //顯示該頁電影資料
    })
    .catch(error => console.log(error))

  // ===============EventListeners======================
  //listen to data panel
  dataPanel.addEventListener("click", event => {
    //按到more按鈕才顯示該電影詳情
    if (event.target.matches(".btn-show-movie")) {
      showMovieDetail(event.target.dataset.id)
      //如果按到+鈕才加到最愛清單
    } else if (event.target.matches(".btn-add-favorite")) {
      addFavoriteItem(event.target.dataset.id)
    }
  })

  //listen to search form submit event
  searchForm.addEventListener("submit", event => {
    event.preventDefault()
    // let input = searchInput.value.toLowerCase() //取出input值並轉為小寫
    // let results = data.filter(movie =>
    //   movie.title.toLowerCase().includes(input) //把資料值都轉成小寫並比對是否有和input符合的字串，true的回傳
    //另解：用正規表達式                          
    let results = []
    const regex =new RegExp(searchInput.value,'i')
    results=data.filter(movie => movie.title.match(regex))
    // console.log(results.length)
    getTotalPages(results)
    getPageData(1, results)
  })

  //listen to pagination click event
  pagination.addEventListener("click", event => {
    if (event.target.tagName === "A") {
      getPageData(event.target.dataset.page)
    }
  })

  //listen to change mode event
  modeIcon.addEventListener("click", event => {
    if (event.target.matches(".fa-bars")) {
      console.log('list')
      displayMode = "list"
      displayData(pageData, displayMode)
    } else if (event.target.classList.contains("fa-th")) {
      console.log('card')
      displayMode = "card"
      displayData(pageData, displayMode)
    }
  })
  // =================My functions========================
  //計算分幾頁
  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE)
    let pageItemContent = ""
    if(totalPages===0){
      pagination.innerHTML = `<li class="page-item">
          <a class="page-link" href="javascript:;">1</a>
        </li>`
    }else if (totalPages>0){
      for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
      <li class="page-item">
        <a class="page-link" href="javascript:;" data-page="${i + 1}">${i +
        1}</a>
      </li>
      `
      pagination.innerHTML = pageItemContent
      }
    }
  }

  //當頁要顯示哪些資料
  function getPageData(pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayData(pageData, displayMode)
  }
  //顯示傳入的資料
  function displayData(data, displayMode) {
    // console.log(data)
    let htmlContent = (displayMode === "list") ? listHtml(data) : cardHtml(data)
    dataPanel.innerHTML = htmlContent
  }
  //製造card樣式
  function cardHtml(pageData) {
    let htmlContent = ""
    pageData.forEach(item => {
      htmlContent += `
      <div class="col-sm-3">
      <div class="card mb-2">
        <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
        <div class="card-body movie-item-body text-center">
          <h6 class="card-title">${item.title}</h5>
        </div>

        <!-- "More" button -->
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal " data-id="${item.id}">More</button>

        <!-- favorite button --> 
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  `
    })
    return htmlContent
  }
  // 製造list樣式
  function listHtml(pageData) {
    let htmlContent = ""
    pageData.forEach(item => {
      htmlContent += `
      <table class="table">
          <tr>
            <th>${item.title}</th>
            <td class="text-right">
                <!-- "More" button -->
                  <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal " data-id="${item.id}">More</button>
                <!-- favorite button --> 
                  <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </td>
          </tr>
      </table>
  `
    })
    return htmlContent
  }

  //在modal中顯示電影詳情
  function showMovieDetail(id) {
    //get elements
    const modalTitle = document.getElementById("show-movie-title")
    const modalImage = document.getElementById("show-movie-image")
    const modalData = document.getElementById("show-movie-date")
    const modalDescription = document.getElementById("show-movie-description")
    //set request url
    const url = INDEX_URL + id
    console.log(url)
    //send request to show API
    axios
      .get(url)
      .then(response => {
        const data = response.data.results
        //insert data into modal UI
        modalTitle.textContent = data.title
        modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
        modalData.textContent = `release at :${data.release_date}`
        modalDescription.textContent = `${data.description}`
      })
      .catch(error => console.log(error))
  }

  //增加最愛電影並存在local storage
  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
    const movie = data.find(item => item.id === Number(id))
    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list`)
    }
    localStorage.setItem("favoriteMovies", JSON.stringify(list))

  }
})()
