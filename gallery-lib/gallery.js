const GalleryClassName = 'gallery'
const GalleryLineClassName = 'gallery-line'
const GallerySlideClassName = 'gallery-slide'

class Gallery {
  constructor(elem, options = {}) {
    this.containerNode = elem
    this.size = elem.childElementCount
    this.currentSlide = 0
    this.currentSlideWasChanged = false

    this.settings = {
      margin: options.margin || 0
    }

    this.startDrag = this.startDrag.bind(this)
    this.stopDrag = this.stopDrag.bind(this)
    this.dragging = this.dragging.bind(this)
    this.resizeGallery = this.resizeGallery.bind(this)

    this.manageHTML = this.manageHTML.bind(this)
    this.setParameters = this.setParameters.bind(this)
    this.setEvents = this.setEvents.bind(this)

    this.manageHTML()
    this.setParameters()
    this.setEvents()


  }

  setEvents() {
    this.debouncedResize = debounce(this.resizeGallery, 0)
    window.addEventListener('resize', this.debouncedResize)
    window.addEventListener('pointerdown', this.startDrag)
    window.addEventListener('pointerup', this.stopDrag)
  }

  destroyEvents() {
    window.removeEventListener('resize', this.debouncedResize)
    window.removeEventListener('pointerdown', this.startDrag)
    window.removeEventListener('pointerup', this.stopDrag)
  }


  startDrag(event) {
    window.addEventListener('pointermove', this.dragging)
    this.startX = this.x
    this.clickX = event.pageX
  }

  stopDrag() {
    window.removeEventListener('pointermove', this.dragging)
    this.x = - this.currentSlide * this.width
    this.setStylePosition()
    this.currentSlideWasChanged = false
  }


  dragging(event) {
    this.dragX = event.pageX
    let dragShift = this.dragX - this.clickX

    const easing = dragShift / 5
    this.x = Math.max(Math.min(this.startX + dragShift, easing), this.maximumX + easing)

    this.setStylePosition()


    if (dragShift > 20 && dragShift > 0 && this.currentSlide > 0 && !this.currentSlideWasChanged) {
      this.currentSlideWasChanged = true
      this.currentSlide--
    }

    if (dragShift < -20 && dragShift < 0 && !this.currentSlideWasChanged && this.currentSlide < this.size - 1) {
      this.currentSlideWasChanged = true
      this.currentSlide++
    }
  }

  setStylePosition() {
    this.lineNode.style.transform = `translate3D(${this.x}px, 0, 0)`
  }
  resizeGallery() {
    this.setParameters()
  }

  manageHTML() {
    this.containerNode.classList.add(GalleryClassName)
    this.containerNode.innerHTML = `
      <div class="${GalleryLineClassName}">
        ${this.containerNode.innerHTML}
      </div>
    `

    this.lineNode = this.containerNode.querySelector(`.${GalleryLineClassName}`)
    this.lineNode.style.gap = this.settings.margin + 'px'

    this.slideNodes = Array.from(this.lineNode.children).map(childNode => wrapElementByDiv({
      element: childNode,
      className: GallerySlideClassName
    }))
  }

  setParameters() {
    let coordsContainer = this.containerNode.getBoundingClientRect()

    this.width = coordsContainer.width
    this.maximumX = -(this.size - 1) * this.width
    this.x = -this.currentSlide * this.width
    this.lineNode.style.width = this.size * this.width + 'px'
    Array.from(this.slideNodes).forEach(slide => {
      slide.style.width = this.width + 'px'
    })
  }
}


function wrapElementByDiv({ element, className }) {
  const wrapperNode = document.createElement('div')

  wrapperNode.classList.add(className)
  element.parentNode.insertBefore(wrapperNode, element)

  wrapperNode.appendChild(element)

  return wrapperNode
}


function debounce(fn, ms) {
  let timer;
  return function (event) {
    clearTimeout(timer)
    timer = setTimeout(fn, ms, event)
  }
}