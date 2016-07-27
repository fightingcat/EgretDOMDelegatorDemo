class WebElement extends egret.Sprite {
    private static getStyleKey(styleName: string) {
        let style = document.createElement('div').style;

        for (let prefix of ['', 'webkit', 'ms', 'Moz', 'O']) {
            if (prefix + styleName in style) {
                return prefix + styleName;
            }
        }
        return styleName;
    }
    private static cssOpacity = WebElement.getStyleKey('opacity');
    private static cssTransform = WebElement.getStyleKey('transform');
    private static cssTransformOrigin = WebElement.getStyleKey('transform-origin');

    private _element: HTMLDivElement;
    private canvas: HTMLCanvasElement;
    private container: HTMLDivElement;
    private finalMatrix = new egret.Matrix();
    private stageRotation: number = 0;
    private stageScaleX: number = 1;
    private stageScaleY: number = 1;

    public constructor(content?: string) {
        super();
        let element = document.createElement('div');
        let style = element.style;
        style.position = 'absolute';
        style.margin = style.padding = '0';
        style.minWidth = style.minHeight = '0';
        style[WebElement.cssTransformOrigin] = '0 0 0';
        if (content) {
            element.innerHTML = content;
        }
        this._element = element;
    }

    public get element(): HTMLDivElement {
        return this._element;
    }

    $onAddToStage(stage: egret.Stage, nestLevel: number): void {
        super.$onAddToStage(stage, nestLevel);
        this.canvas = stage.$screen['canvas'];
        this.container = stage.$screen['container'];
        this.container.appendChild(this._element);
        this.onStageResized();
        stage.addEventListener(egret.Event.RESIZE, this.onStageResized, this);
    }

    $onRemoveFromStage(): void {
        super.$onRemoveFromStage();
        this.stage.removeEventListener(egret.Event.RESIZE, this.onStageResized, this);
        if (this._element.parentNode) {
            this._element.parentNode.removeChild(this._element);
        }
    }

    $update(dirtyRegionPolicy: string, bounds?: egret.Rectangle): boolean {
        if (this.$hasFlags(egret.sys.DisplayObjectFlags.InvalidConcatenatedMatrix)) {
            this.updateTransform();
        }
        if (this.$hasFlags(egret.sys.DisplayObjectFlags.InvalidConcatenatedAlpha)) {
            this.updateAlpha();
        }
        if (this.$hasFlags(egret.sys.DisplayObjectFlags.InvalidConcatenatedVisible)) {
            this.updateVisible();
        }
        return super.$update(dirtyRegionPolicy, bounds);;
    }

    private onStageResized() {
        let canvasX = this.canvas.offsetLeft;
        let canvasY = this.canvas.offsetTop;
        let canvasW = this.canvas.clientWidth;
        let canvasH = this.canvas.clientHeight;
        let elementStyle = this._element.style;
        let transform = this.canvas.style[WebElement.cssTransform];

        this.stageRotation = +/(-?\d+)(?=deg)/.exec(transform)[0] || 0;
        this.stageScaleX = canvasW / this.stage.stageWidth;
        this.stageScaleY = canvasH / this.stage.stageHeight;

        if (this.stageRotation == 90) {
            elementStyle.left = `${canvasX - canvasH}px`;
            elementStyle.top = `${canvasY}px`;

        } else if (this.stageRotation == -90) {
            elementStyle.left = `${canvasX}px`;
            elementStyle.top = `${canvasY - canvasW}px`;

        } else {
            elementStyle.left = `${canvasX}px`;
            elementStyle.top = `${canvasY}px`;
        }
        this.updateTransform();
    }

    private updateTransform() {
        let canvasW = this.canvas.clientWidth;
        let canvasH = this.canvas.clientHeight;
        let scaleX = this.stageScaleX;
        let scaleY = this.stageScaleY;
        let m = this.finalMatrix.copyFrom(this.$getConcatenatedMatrix());

        if (this.stageRotation == 90) {
            let tx = m.tx, a1 = m.a, c1 = m.c;
            m.a = m.b * -scaleX;
            m.b = a1 * scaleX;
            m.c = m.d * -scaleX;
            m.d = c1 * scaleX;
            m.tx = canvasH - scaleY * (m.ty + this.height);
            m.ty = scaleX * tx;

        } else if (this.stageRotation == -90) {
            let tx = m.tx, a1 = m.a, c1 = m.c;
            m.a = m.b * scaleX;
            m.b = a1 * -scaleX;
            m.c = m.d * scaleX;
            m.d = c1 * -scaleX;
            m.tx = scaleY * m.ty;
            m.ty = canvasW - scaleX * tx;

        } else if (this.stageRotation == 0) {
            let a1 = m.a, c1 = m.c;
            m.a = a1 * scaleX;
            m.b = m.b * scaleY;
            m.c = c1 * scaleX;
            m.d = m.d * scaleY;
            m.tx *= scaleX;
            m.ty *= scaleY;
        }
        let style = this._element.style;
        style[WebElement.cssTransform] = `matrix(${m.a},${m.b},${m.c},${m.d},${m.tx},${m.ty})`;
        style.minWidth = `${this.width}px`;
        style.minHeight = `${this.height}px`;
    }

    private updateAlpha() {
        this._element.style[WebElement.cssOpacity] = `${this.$getConcatenatedAlpha()}`;
    }

    private updateVisible() {
        this._element.style.display = this.$getConcatenatedVisible() ? "" : "none";
    }
}