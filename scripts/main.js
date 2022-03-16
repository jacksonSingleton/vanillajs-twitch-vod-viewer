import env from './env.js'


// fetch with bearer token
const fetchWithToken = async (url, options) => {
  const headers = options.headers || {}
  headers.Authorization = `Bearer ${env.OAUTH_TOKEN}`
  headers['Client-Id'] = env.CLIENT_ID;
  return fetch(url, {
    ...options,
    headers
  })
}

const createThumbnailImage = ( video ) => {
  const thumbnail = video.thumbnail_url.replace('%{width}', '320').replace('%{height}', '240')
  const thumb = document.createElement('img')
  thumb.src = thumbnail
  thumb.classList.add('thumbnail')
  return thumb
}

const createContainerElement = ( video, imgEl ) => {
  if(window.location.href !== imgEl.src){
    const container = document.createElement('div')
    container.classList.add('container')
    container.setAttribute('data-video', video.url)
    //const link = document.createElement('a')
    const title = document.createElement('h3')
    title.innerHTML = video.title.slice(0, 25) + "..."
    //container.appendChild(link)
    container.addEventListener('click', handleClick)
    container.appendChild(imgEl)
    container.appendChild(title)
    //link.href = video.url
    //link.target = "_blank"
    return container
  }
}

const getTwitchId = async (url) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/g
  const match = regex.exec(url)
  const id = fetchWithToken(`https://api.twitch.tv/helix/users?login=${match[1]}`, {}).then(res => res.json()).then(res => res.data[0].id).catch(console.error)
  return id
}

const clear = () => {
  const main = document.querySelector('main')
  main.innerHTML = ''
}
const handleSubmit = async (e) => {
  clear()
  e.preventDefault()
  const url = e.target[0].value
  const id = await getTwitchId(url)
  console.log(await id)
  let response = await fetchWithToken(`https://api.twitch.tv/helix/videos?user_id=${id}`, {}).catch(console.error)
  .then(res =>res.json())
  .then(vals => vals.data)
  renderElements(response)
}

const closeModal = () => {
  const modal = document.getElementById('twitch-embed')
  const modalBackground = document.getElementById('modal-background')
  if(modal){
    modal.parentNode.removeChild(modal)
    modalBackground.parentNode.removeChild(modalBackground)
  }
}
const handleClick = (e) => {
  closeModal()
  const url = e.target.parentNode.getAttribute('data-video')
  const id = url.split('/')[4]
  const modalBackground = document.createElement('div')
  modalBackground.id = 'modal-background'
  modalBackground.addEventListener('click', closeModal)
  const modal = document.createElement('div')
  modal.id = 'twitch-embed'
  document.body.appendChild(modal)
  modal.appendChild(modalBackground)
  document.body.addEventListener('keyup', (e) => {
    if(e.key === "Escape"){
      closeModal()
    }
  })
  new Twitch.Embed("twitch-embed", {
        width: window.innerWidth * 0.6,
        height: window.innerWidth * 0.33,
        video: id,
        layout: "video-with-chat"

      });
}
const renderElements = (videos) => {
  const main = document.querySelector('main');
  for(const video of videos) {
    let thumb = createThumbnailImage(video)
    let containerElement = createContainerElement(video, thumb) 
    if (containerElement)
      main.appendChild(containerElement)
  }
}

document.getElementById('form').addEventListener('submit', handleSubmit)
