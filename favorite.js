(function () {
    const BASE_URL = "https://movie-list.alphacamp.io/"
    const INDEX_URL = BASE_URL + "api/v1/movies/"
    const POSTER_URL = BASE_URL + "posters/"
    const dataPanel=document.getElementById('data-panel')
    const data = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    console.log(data)

    displayDataList(data)

    dataPanel.addEventListener('click',(event)=>{
        if(event.target.matches('.btn-show-movie')){
            showMovie(event.target.dataset.id)
        }else if(event.target.matches('.btn-remove-favorite')){
          // let x=event.target.dataset.id
          // console.log(typeof x)  
          removeFavoriteItem(event.target.dataset.id)
        }
    })
    
    function displayDataList(data){
        let htmlContent = ''
        data.forEach(function (item,index) {
            htmlContent += `
            <div class="col-sm-3">
            <div class="card mb-2">
              <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
              <div class="card-body movie-item-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
              </div>
            </div>
          </div>
            `
        }) 
        dataPanel.innerHTML=htmlContent  
    }

    function showMovie(id) {
        //get element
    const modalTitle=document.getElementById('show-movie-title')
    const modalImage=document.getElementById('show-movie-image')
    const modalData=document.getElementById('show-movie-date')
    const modalDescription=document.getElementById('show-movie-description')
    //set request url
    const url =INDEX_URL+id
    // console.log(url)
    //send request to show api
    axios
            .get(url)
            .then((response)=>{
              console.log(response.data.results)
              const data = response.data.results
              //insert data into modal ui
              // console.log(data.title)
              modalTitle.textContent=data.title
              modalImage.innerHTML=`<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
              modalData.textContent=`release at :${data.release_date}`
              modalDescription.textContent=`${data.description}`
            })
            .catch((error)=>console.log(error))
    }

    function removeFavoriteItem(id) {
        //find movie by id
        console.log(id)
        const index = data.findIndex(item =>item.id === Number(id))
        //沒找到
        if (index === -1) return

        //remove movie and update localStorage
        data.splice(index,1)
        localStorage.setItem('favoriteMovies',JSON.stringify(data))

        //repaint dataList
        displayDataList(data)
    }
})()