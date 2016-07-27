class Main extends egret.DisplayObjectContainer {
    private preview: egret.Bitmap;

    public constructor() {
        super();
        this.initialize();
    }

    private initialize() {
        let html = `
            <style>
            .file-chooser {
                width: 100px;
                height: 40px;
                background-color:#44c767;
                -moz-border-radius:28px;
                -webkit-border-radius:28px;
                border-radius:28px;
                border:1px solid #18ab29;
                display:inline-block;
                cursor:pointer;
                color:#ffffff;
                font-family:Arial;
                font-size:17px;
                text-decoration:none;
                text-shadow:0px 1px 0px #2f6627;
                text-align: center;
                vertical-align: middle;
            }
            .file-chooser:hover {
                background-color:#5cbf2a;
            }
            .file-chooser:active {
                position:relative;
                top:1px;
            }
            .file-chooser input[type=file] {
                display: none;
            }
            </style>
            <label class="file-chooser"><span>点我</span><input type="file" accept="image/*" /></label>`;

        // 用上面的html创建一个代理对象
        let delegator = new WebElement(html);
        this.addChild(delegator);
        delegator.x = 240;
        delegator.y = 400;
        delegator.anchorOffsetX = 50;
        delegator.anchorOffsetY = 25;
        // 简单加个动画
        egret.Tween.get(delegator, { loop: true }).to({
            rotation: 360,
            alpha: 0
        }, 2000);

        // 取得input,监听change事件
        let input = delegator.element.querySelector('.file-chooser input[type=file]');
        input.addEventListener('change', this.onFileChanged.bind(this));

        // 创建用于预览的位图对象
        this.preview = new egret.Bitmap();
        this.addChild(this.preview);
    }

    private onFileChanged(event: Event) {
        let files = (event.target as HTMLInputElement).files;
        if (files.length == 0) return;

        // 预览
        let image = new Image();
        image.src = URL.createObjectURL(files[0]);
        image.onload = () => {
            this.preview.texture = image as any;
        };
    }
}