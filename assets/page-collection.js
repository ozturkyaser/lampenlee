// ---------------------------------------------------------------
// Collection page
// ---------------------------------------------------------------


// custom.js
// -----------------------------------------------

// Adds 'in-col' class to slider elements inside module containers, except those with excluded width classes.  
Array.from(module_collection).forEach(container => {
	Array.from(container.querySelectorAll('.l4cl.slider:not(.w12, .w14, .w16, .w20, .w25, .w33, .w50)')).forEach(element => {
		element.classList.add('in-col');
	});
});



// custom-async.js
// -----------------------------------------------
// Grid or list view
var saveCollectionview = function(attribute, value) {
  const config = {
    method: 'POST',
    body: JSON.stringify({
      attributes: {
        [attribute]: value
      }
    }),
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'Accept': 'application/javascript'
    }
  };
  fetch(routes.cart_update_url, config)
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          handleErrorMessage(response.description);
          return;
        }
      })
      .catch((error) => {
        console.log("saveCollectionview error", error);
      });
}

function insertAfter(referenceNode, newNode) {
referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

var clearRangeInputs = function(minInput, maxInput) {
var minInput = document.querySelector('#filter input#min'),
    maxInput = document.querySelector('#filter input#max');
if (minInput && maxInput) {
  minInput.removeAttribute('name');
  maxInput.removeAttribute('name');
}
}
var clearAllInputs = function() {
clearRangeInputs();
var inputs = document.querySelectorAll('#filter input[type="checkbox"]:checked');
Array.from(inputs).forEach(function (el) {
  el.checked = false;
});
}

function saveLoadMoreAnchor() {
let anchors = document.querySelectorAll('#collection > li > figure > a, .m6cl .results > div a, .m6cl .results > .l4ne a');
if (anchors) {
  Array.from(anchors).forEach(function (el) {
    el.addEventListener('click', function(e) {
      localStorage.setItem('loadMoreItemClicked', el.getAttribute('href'));
    });
  });
}
}

// Attaches click handlers to aside navigation toggle links, calling toggle_dropdowns_simple() on their parent element.  
const navAsideEvt = new CustomEvent("navAside")
window.addEventListener("navAside", function(evt) {
    const nav_aside = document.querySelectorAll('.n6as a.toggle:not(.n6as-initalized)');
        if (nav_aside.length) {
            nav_aside.forEach(function (el) {
            el.classList.add('n6as-initalized');
            el.addEventListener('click', function (e) {
                toggle_dropdowns_simple(el.parentElement);
                e.preventDefault();
            });
            });
        }
    });
window.dispatchEvent(navAsideEvt);

let forceFormFilterRender = false;
const filtersEvt = new CustomEvent("filters");
window.addEventListener("filters", function(evt) {
    // Manages the filter panel: initializes filter toggles, handles open/close actions, and toggles filter subsections on click or key events.  
	const form_filter = document.getElementsByClassName('f8fl');
	if (form_filter.length) {
		html_tag.classList.add('t1cl');
		let formFilterRendered = false;

		function renderFormFilter() {
			if (!formFilterRendered) {
				Array.from(form_filter).forEach(function (el) {
					append_url(el, 'Close', 'f8fl-toggle');

					const elementId = el.getAttribute('id');

					if (elementId) {
						Array.from(document.querySelectorAll(`[href="#${elementId}"]`)).forEach(link => {
							link.classList.add('f8fl-toggle');
						});
					}
					Array.from(el.querySelectorAll('h1, h2, h3, h4, h5, h6')).forEach(function (el) {
						append_url(el, 'Close', 'header-toggle');
					});
				});
				Array.from(document.getElementsByClassName('f8fl-toggle')).forEach(function (el) {
					el.setAttribute('aria-controls', 'filter');
				});
				formFilterRendered = true;
			}
		}

		function handleFilterClick(event) {
			renderFormFilter();
			if (event.target.matches('a[aria-controls="filter"], a[aria-controls="filter"] *')) {
				html_tag.classList.add('has-filters');
				if (!html_tag.classList.contains('f8fl-open')) {
					hidePanels();
					html_tag.classList.add('f8fl-open');
				} else {
					html_tag.classList.remove('f8fl-open');
				}
				if (event.target.closest('.m6pn') !== null) {
					overlayClose();
				}
				getStickyFooters();
				new_css('css-filters', window.filepaths['async_filters_css']);
				new_css('css-search', window.filepaths['async_search_css']);
				event.preventDefault();
			}
		}

		function handleFilterSub(event) {
			if (event.target.matches('.f8fl a.header-toggle, .f8fl a.header-toggle *')) {
				const closestH = event.target.closest('h1, h2, h3, h4, h5, h6');
				toggle_dropdowns_simple(closestH);
				if (closestH.classList.contains('toggle') && typeof runPaddingsForInputs === 'function') {
					Array.from(nextUntil(closestH, 'h1, h2, h3, h4, h5, h6')).forEach(function (el) {
						Array.from(el.querySelectorAll('[class*="input-"][class*="fix"]')).forEach(runPaddingsForInputs);
					});
				}
				if (!closestH.hasAttribute('id')) {
					event.preventDefault();
				}
			}
		}

		if (forceFormFilterRender) {
			renderFormFilter();
			forceFormFilterRender = false;
		}
		if (!formFilterRendered) {
			document.addEventListener('click', handleFilterClick);
			document.addEventListener('click', handleFilterSub);
			document.addEventListener('keyup', function (event) {
				if (event.key === ' ') {
					handleFilterClick(event);
					handleFilterSub(event);
				}
			});
		}
	}

	var form_sort = document.getElementsByClassName('f8sr'),
			form_sort_list_view,
			form_sort_list_inline;

	function clearSortForm() {
		Array.from(form_sort).forEach((el) => {
			el.classList.remove('fixed');
			html_tag.classList.remove('f8sr-fixed');
		});
	}

    if (form_sort.length) {
        Array.from(form_sort).forEach(function (form_cont) {
        html_tag.classList.add('t1cl');
        if (form_cont.classList.contains('mobile-sticky') || form_cont.classList.contains('sticky')) {
            const trickDiv = createElementWithClass('div', 'offset-dist');
            const trickDist = createElementWithClass('div', 'inner-dist');

            function updateTrickDistHeight(div) {
              if (!div || div.hasHeight || !form_cont) return;
      
              requestAnimationFrame(() => {
                const h = form_cont.offsetHeight;
                div.style.height = `${h}px`;
                root_styles.style.setProperty('--f8sr_height', `${h}px`);
                div.hasHeight = true;
              });
            }
      
            //let updateSearchHeightExecuted = false;
            let updateSearchHeightRAF = 0;
      
            function applySearchHeight() {
              updateSearchHeightRAF = 0;
              if (!search_id) return;
      
              const h = search_id.clientHeight;
              if (h <= 0) return;
      
              root_styles.style.setProperty('--search_height', `${h}px`);
              //updateSearchHeightExecuted = true;
            }
      
            function updateSearchHeight() {
              if (!updateSearchHeightRAF) {
                updateSearchHeightRAF = requestAnimationFrame(applySearchHeight);
              }
            }

            function createEventListeners(element) {
              window.addEventListener('scroll', function () {
                updateTrickDistHeight(element);
                updateSearchHeight();
              });
              /*window.addEventListener('resize', throttle(() => {
                updateTrickDistHeight(element);
                updateSearchHeightExecuted = false;
                updateSearchHeight();
              }, 500));
              window.addEventListener('touchstart', function () {
                updateTrickDistHeight(element);
                updateSearchHeight();
              });
              window.addEventListener('keyup', function () {
                updateTrickDistHeight(element);
                updateSearchHeight();
              });*/
            }

            const observer = new IntersectionObserver(
                ([e]) => {
                const boundingRect = e.boundingClientRect;

                if (e.isIntersecting) {
                    //console.log('Element - on screen.');
                    const el_mod = form_cont.classList.contains('sticky') ? e.target.nextElementSibling : form_cont;
                    el_mod.classList.remove('fixed');
                    html_tag.classList.remove('f8sr-fixed');
                } else {
                    const el_mod = form_cont.classList.contains('sticky') ? e.target.nextElementSibling : form_cont;
                    if (boundingRect.top < 0) {
                    //console.log('Element - above screen.');
                    el_mod.classList.add('fixed');
                    html_tag.classList.add('f8sr-fixed');
                    }
                    if (boundingRect.bottom >= window.innerHeight) {
                    //console.log('Element - below screen.');
                    el_mod.classList.remove('fixed');
                    html_tag.classList.remove('f8sr-fixed');
                    }
                }
                }, {
                threshold: [0, 1],
                rootMargin: "0px 0px 0px 0px"
                }
            );

            if (form_cont.classList.contains('sticky')) {
            const trg = form_cont;

            trickDist.classList.add('before-f8sr');
            form_cont.after(trickDiv);
            form_cont.before(trickDist);

            createEventListeners(form_cont.nextElementSibling);

            observer.observe(form_cont.previousElementSibling);
            } else if (form_cont.classList.contains('mobile-sticky') && form_cont.classList.contains('mobile-compact')) {
            const trg = form_cont.querySelector('.link-btn');

            if (trg) {
                if (trg.classList.contains('mobile-hide')) {
                form_cont.classList.add('btn-mobile-hide');
                }
            }
            
            form_cont.prepend(trickDiv);
            form_cont.prepend(trickDist);

            createEventListeners(form_cont.querySelector('.inner-dist'));

            observer.observe(form_cont.querySelector('.offset-dist'));
            if (trg !== undefined && trg !== null) {
                const clone_me = trg.cloneNode(true);
                clone_me.classList.add('clone');
                insertAfter(trg, clone_me);
            }
            }
        }

        form_sort_list_view = form_cont.getElementsByClassName('l4vw');
        form_sort_list_inline = form_cont.getElementsByClassName('l4in');

        if (form_sort_list_view.length) {
            Array.from(form_sort_list_view).forEach(function (el) {
            html_tag.classList.add('t1cl');
            if (el.getAttribute('aria-controls') !== null) {
                var im = el,
                    view_item = el.querySelectorAll('li'),
                    view_list = document.getElementById(im.getAttribute('aria-controls'));
                el.querySelectorAll('a > i[class*="icon-view-"]').forEach(function (el) {
                el.parentElement.addEventListener('click', function (e) {
                    view_item.forEach(function (el) {
                    el.classList.remove('active');
                    });
                    if (el.classList.contains('icon-view-list')) {
                    saveCollectionview('collection_view', 'list');
                    view_list.classList.add('list');
                    form_cont.classList.add('list');
                    im.querySelectorAll('a > i.icon-view-list').forEach(function (el) {
                        el.closest('li').classList.add('active');
                    });
                    view_list.querySelectorAll('a.link-more').forEach(function (linkMore) {
                        handleInfoAndList(linkMore);
                    });
                    }
                    if (el.classList.contains('icon-view-grid')) {
                    saveCollectionview('collection_view', 'grid');
                    view_list.classList.remove('list');
                    form_cont.classList.remove('list');
                    im.querySelectorAll('a > i.icon-view-grid').forEach(function (el) {
                        el.closest('li').classList.add('active');
                    });
                    }
                    e.preventDefault();
                });
                });
            }
            });
        }

        if (form_sort_list_inline.length) {
            Array.from(form_sort_list_inline).forEach(function (el) {
            if (el.getAttribute('aria-controls') !== null) {
                var im = el,
                    view_list = document.getElementById(im.getAttribute('aria-controls'));
                el.querySelectorAll('input').forEach(function (el) {
                el.parentElement.addEventListener('click', function (e) {
                    let className = '';
                    if (el.getAttribute('data-width')) {
                    view_list.classList.remove('w100', 'w50', 'w33', 'w25','w20');
                    saveCollectionview('collection_grid_view', el.getAttribute('data-width'));
                    className = el.getAttribute('data-width');
                    } else if (el.getAttribute('data-width-mobile')) {
                    view_list.classList.remove('w100-mobile', 'w50-mobile');
                    saveCollectionview('collection_grid_view_mobile', el.getAttribute('data-width-mobile'));
                    className = el.getAttribute('data-width-mobile');
                    }
                    view_list.classList.add(className);
                });
                });
            }
            });
        }
        });
    }

});
window.dispatchEvent(filtersEvt);

const initFiltersEvt = new CustomEvent("initFilters");
window.addEventListener("initFilters", function (evt) {
  if (document.getElementById('filter') != null) {
    new_css('form-validation-css', window.filepaths['async_validation_css']);

    // Collectionpage: filters
    var processFilters = function() {
      var filter_form_template = filter_form.dataset.template;
      var collectionSection = document.getElementById('shopify-section-' + filter_form_template);
      let sidebarGlobal = document.querySelector('.filters-aside-initialized');
      filter_form.classList.add('processing');
      if (collectionSection.querySelector('.l4cl:not(.bls)')) {
        collectionSection.querySelector('.l4cl:not(.bls)').classList.add('processing');
      }
      var minInput = document.querySelector('#filter input#min'),
          maxInput = document.querySelector('#filter input#max');
      if ((minInput && maxInput) && minInput.value == minInput.getAttribute('min') && maxInput.value == maxInput.getAttribute('max')) {
        clearRangeInputs();
      }
      var filterFormData = new FormData(document.getElementById('filter'));
      var filterParams = new URLSearchParams(filterFormData).toString();
      const filterUrl = window.location.pathname + '?section_id=' + filter_form_template + '&' + filterParams;
      fetch(filterUrl)
          .then((response) => {
            if (!response.ok) {
              var error = new Error(response.status);
              throw error;
            }
            return response.text();
          })
          .then((text) => {
            const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-' + filter_form_template);
            Array.from(filter_form.querySelectorAll('h4[data-filter-toggle].toggle')).forEach(function (el) {
              resultsMarkup.querySelector('h4[data-filter-toggle="'+ el.dataset.filterToggle +'"]').classList.add('toggle');
            });
            const toggledLinkMore = filter_form.querySelectorAll('ul[data-filter-toggle].link-more-clicked');
            collectionSection.innerHTML = resultsMarkup.innerHTML;

            // check if drawer is enabled
            if (document.querySelector('.filters-aside-initialized')) {

              // replace HTML
              const drawerMarkup = resultsMarkup.querySelector('#filters-aside')
              sidebarGlobal.innerHTML = drawerMarkup.innerHTML;
              sidebarGlobal.classList.add('processed-filter');

              // remove section filters there is always one.
              document.querySelector('#filters-aside:not(.filters-aside-initialized)').remove();
            }
            linkMore();
            Array.from(toggledLinkMore).forEach(function (el) {
              collectionSection.querySelector('ul[data-filter-toggle="'+ el.dataset.filterToggle +'"] a.link-more').click();
            });
            if (document.querySelector('.collection-wrapper')) {
              document.querySelector('.collection-wrapper').scrollIntoView();
            } else {
              window.scrollTo(0, 0);
            }
            history.pushState({ filterParams }, '', `${window.location.pathname}${filterParams && '?'.concat(filterParams)}`);
            window.dispatchEvent(collectionSortEvt);
            window.dispatchEvent(rangeSliderEvt);
            forceFormFilterRender = true;
            window.dispatchEvent(initFiltersEvt);
            window.dispatchEvent(filtersEvt);
            window.dispatchEvent(modulePanelEvt);
            window.dispatchEvent(ratingsEvt);
            window.dispatchEvent(semanticInputEvt);
            window.dispatchEvent(semanticSelectEvt);
            window.dispatchEvent(schemeTooltipEvt);
            window.dispatchEvent(popupsEvt);
            window.dispatchEvent(collectionLoadMoreEvt);
            window.dispatchEvent(listScrollableEvt);
            window.dispatchEvent(modulePanelAnchorEvt);
            window.dispatchEvent(productcardVariantsEvt);
            window.dispatchEvent(listCollectionSliderEvt);
            window.check_limit_event();
            ajaxCart.init();
            quickShop.init();
            window.dispatchEvent(heightLimitEvt);
          })
          .catch((error) => {
            console.log("processFilters error", error);
            throw error;
          });
    };

    let filter_form = document.getElementById('filter');
    var form_filter_input_anchors = filter_form.querySelectorAll('li label a');
    Array.from(form_filter_input_anchors).forEach(function (el) {
      el.classList.add('no-click');
    });

    var form_filter_clear = filter_form.querySelectorAll('a.remove-all, a.clear-range');
    if (form_filter_clear.length) {
      Array.from(form_filter_clear).forEach(function (el) {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          if (el.classList.contains('remove-all')) {
            clearAllInputs();
          } else {
            clearRangeInputs();
          }
          processFilters();
        })
      });
    }
    var form_filter_inputs = document.querySelectorAll('#filter input');
    if (form_filter_inputs.length) {
      Array.from(form_filter_inputs).forEach(function (el) {
        el.addEventListener('change', function(event) {
          processFilters();
        });
      });
    }

    var layout = document.getElementById('filter').dataset.drawer;
    var filters = document.querySelector('.collection-wrapper').dataset.filters;
    if ( (filtersDrawerContent && layout === 'static') || (!filters && layout === 'drawer') ) {
      document.querySelector('#root .filters-aside-initialized').remove();
      hidePanels();
      return
    }

    var filtersDrawerContent = document.querySelector('#filters-aside');
    if (layout === 'drawer') {
      var editor = filtersDrawerContent.dataset.editor
      if(!document.querySelector('#root .filters-aside-initialized')){
        document.querySelector('#root').appendChild(filtersDrawerContent);
        filtersDrawerContent.classList.add('filters-aside-initialized');
      } else {
        if (editor) {
          if(filtersDrawerContent.classList.contains('inv')){
            document.querySelector('#root .filters-aside-initialized').classList.add('inv')
          } else {
            document.querySelector('#root .filters-aside-initialized').classList.remove('inv')
          }
          if (!document.querySelector('#root .filters-aside-initialized').classList.contains('processed-filter')){
            // processFilters();
          }
          document.querySelector('#root .filters-aside-initialized').classList.remove('processed-filter');
        }
      }
      window.dispatchEvent(navAsideEvt);
    }
  }
});
window.dispatchEvent(initFiltersEvt);

const collectionLoadMoreEvt = new CustomEvent("collectionLoadMore");
window.addEventListener("collectionLoadMore", function (evt) {
  var collection_load_more = document.querySelectorAll('#load-more-button[data-next], #load-more-button[data-prev]');
  if (collection_load_more) {
    Array.from(collection_load_more).forEach(function (button) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        var template = button.getAttribute('data-section'),
            collectionSection = document.getElementById('shopify-section-' + template),
            curr_products = collectionSection.querySelector('.results, .l4cl:not(.bls, .category)'),
            pagination_info = document.getElementById('load-more-info');
        if (button.getAttribute('data-next') != null) {
          var direction = 'next'
        } else {
          var direction = 'prev';
        }
        button.classList.add('loading');
        fetch(button.getAttribute('href'))
            .then((response) => {
              if (!response.ok) {
                var error = new Error(response.status);
                throw error;
              }
              return response.text();
            })
            .then((text) => {
              const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-' + template);
              var	new_products = resultsMarkup.querySelector('.results, .l4cl:not(.bls, .category)'),
                  new_button = resultsMarkup.querySelector('#load-more-button[data-'+ direction +'], #load-more-button[data-top]'),
                  new_pagination_info = resultsMarkup.querySelector('#load-more-info');

              if (direction == 'prev'){
                var lastScrollHeight = curr_products.scrollHeight;
              }
              if (curr_products && new_products) {
                if (direction == 'next') {
                  Array.from(new_products.children).forEach(function (el) {
                    curr_products.appendChild(el);
                  });
                } else {
                  Array.from(new_products.children).reverse().forEach(function (el) {
                    curr_products.insertBefore(el, curr_products.firstChild);
                  });
                }
              }
              if (direction == 'next' && pagination_info && pagination_info.parentNode && new_pagination_info) {
                pagination_info.parentNode.replaceChild(new_pagination_info, pagination_info);
              }
              if (button && button.parentNode && new_button) {
                button.parentNode.replaceChild(new_button, button);
              } else if (button && direction == 'prev') {
                button.parentNode.remove();
              }
              if (direction == 'prev'){
                var scrollDiff = curr_products.scrollHeight - lastScrollHeight,
                    scrollTo = curr_products.scrollTop += scrollDiff;
                window.scrollTo({
                  top: scrollTo,
                  behavior: 'instant',
                });
              }
              window.history.replaceState({}, '', button.getAttribute('href'));
              saveLoadMoreAnchor();
              window.dispatchEvent(ratingsEvt);
              window.dispatchEvent(semanticInputEvt);
              window.dispatchEvent(schemeTooltipEvt);
              window.dispatchEvent(popupsEvt);
              window.dispatchEvent(collectionLoadMoreEvt);
              window.dispatchEvent(listScrollableEvt);
              window.dispatchEvent(productVariantsEvt);
              window.dispatchEvent(formZindexEvt);
              window.dispatchEvent(semanticSelectEvt);
              window.check_limit_event();
              ajaxCart.init();
              quickShop.init();
            })
            .catch((error) => {
              console.log("collectionLoadMore error", error);
              throw error;
            });
      });
    });
  }
});
window.dispatchEvent(collectionLoadMoreEvt);

// Collectionpage: sort_by
const collectionSortEvt = new CustomEvent("collectionSort");
window.addEventListener("collectionSort", function (evt) {
    var sort_by = document.getElementById('sort_by'),
        sort_by_clone = document.getElementsByClassName('sort_by_clone')[0];
    if (sort_by != null) {
      Shopify.queryParams = [];
      if (location.search.length) {
        for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
          aKeyValue = aCouples[i].split('=');
          if (aKeyValue.length > 1) {
            Shopify.queryParams.push({
              key: decodeURIComponent(aKeyValue[0]),
              value: decodeURIComponent(aKeyValue[1])
            });
          }
        }
      }
      sort_by.addEventListener('change', function() {
        var el = this;
        if (sort_by_clone != null) { sort_by_clone.value == el.value; }
        setTimeout(function () {
          function findIndexByProperty(data, key, value) {
            for (var i = 0; i < data.length; i++) {
              if (data[i][key] == value) {
                return i;
              }
            }
            return -1;
          }
          var sort_by =  {
            key: 'sort_by',
            value: el.value
          };
          var sort_by_index = findIndexByProperty(Shopify.queryParams, 'key', 'sort_by');
          if (sort_by_index > -1) {
            Shopify.queryParams[sort_by_index] = sort_by;
          } else {
            Shopify.queryParams.push(sort_by);
          }
          var url = '';
          for (var i = 0; i < Shopify.queryParams.length; i++) {
            url += encodeURIComponent(Shopify.queryParams[i].key) + '=' + Shopify.queryParams[i].value;
            if (i < Shopify.queryParams.length - 1) {
              url += '&';
            }
          }
          location.search = url;
        },1);
      });
    }
});
window.dispatchEvent(collectionSortEvt);
  