import {logger} from '../aurelia-orm';
import {bindingMode} from 'aurelia-binding';
import {bindable, customElement} from 'aurelia-templating';

@customElement('paged')
export class Paged {

  // https://github.com/aurelia/templating/issues/73, you still had to set `data` on .two-way when global
  @bindable({defaultBindingMode: bindingMode.twoWay}) data = [];
  @bindable({defaultBindingMode: bindingMode.twoWay}) page = 1;
  @bindable({defaultBindingMode: bindingMode.twoWay}) error;
  @bindable criteria
  @bindable repository                                     = null;
  @bindable resource
  @bindable limit                                          = 30;

  /**
   * Attach to view
   */
  attached() {
    if (!this.page) {
      this.page = 1;
    }

    if (!this.criteria) {
      this.criteria = {};
    }

    this.reloadData();
  }

  /**
   * Reload data
   */
  reloadData() {
    this.getData();
  }

  /**
   * Check if the value is changed
   *
   * @param  {string|{}}   newVal New value
   * @param  {[string|{}]} oldVal Old value
   * @return {Boolean}     Whenever the value is changed
   */
  isChanged(newVal, oldVal) {
    return !this.resource || !newVal || (newVal === oldVal);
  }

  /**
   * Change page
   *
   * @param  {integer} newVal New page value
   * @param  {integer} oldVal Old page value
   */
  pageChanged(newVal, oldVal) {
    if (this.isChanged(newVal, oldVal)) {
      return;
    }

    this.reloadData();
  }

  /**
   * Change criteria
   *
   * @param  {{}} newVal New criteria value
   * @param  {{}} oldVal Old criteria value
   */
  criteriaChanged(newVal, oldVal) {
    if (this.isChanged(newVal, oldVal)) {
      return;
    }

    this.reloadData();
  }

  /**
   * Change resource
   * @param  {string resource New resource value
   */
  resourceChanged(resource) {
    if (!resource) {
      logger.error(`resource is ${typeof resource}. It should be a string or a reference`);
    }

    this.repository = this.entityManager.getRepository(resource);
  }

  /**
   * Get data from repository
   */
  getData() {
    let criteria = JSON.parse(JSON.stringify(this.criteria));
    criteria.skip  = this.page * this.limit - this.limit;
    criteria.limit = this.limit;
    this.error     = null;

    this.repository.find(criteria, true).then(result => {
      this.data = result;
    }).catch(error => this.error = error);
  }
}
