goog.provide('og.Entity');

goog.require('og.math.Vector3');

og.Entity = function (options) {

    options = options || {};

    this.position = new og.math.Vector3();
    this.visibility = true;
    this.id = options.id || ("noname_" + og.Entity.__staticCounter++);

    this.billboard = null;
    //this.label = null;
    //...

    this.childrenNodes = [];
    this.parent = null;

    this._entityCollection = null;
    this._entityCollectionIndex = -1;
};

og.Entity.__staticCounter = 0;

og.Entity.prototype.addTo = function (entityCollection) {
    entityCollection.add(this);
};

og.Entity.prototype.remove = function () {
    this._entityCollection && this._entityCollection.removeEntity(this);
};

og.Entity.prototype.setVisibility = function (visibility) {
    this.visibility = visibility;

    //billboards
    this._billboard.setVisibility(visibility);

    //labels
    //...

    for (var i = 0; i < this.childrenNodes.length; i++) {
        this.childrenNodes[i].setVisibility(visibility);
    }
};

og.Entity.prototype.setPosition = function (position) {
    //billboards
    this._billboard.setPosition(position);

    //labels
    //...

    for (var i = 0; i < this.childrenNodes.length; i++) {
        this.childrenNodes[i].setPosition(position);
    }
};

og.Entity.prototype.setBillboard = function (billboard) {
    if (this.billboard) {
        this.billboard.remove();
    }
    this.billboard = billboard;
    this._entityCollection && this._entityCollection._billboardHandler.add(billboard);
};

og.Entity.prototype.setLabel = function (label) {
    //...
};

og.Entity.prototype.appendChild = function (entity) {
    entity._entityCollection = this._entityCollection;
    entity.parent = this;
    this.childrenNodes.push(entity);
    this._entityCollection && this._entityCollection._addRecursively(entity);
};
