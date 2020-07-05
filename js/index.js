//-----------------------------------------------tools----------------------------------------------
//传入window,让变量名可以被压缩
//传入undefined,让变量名可以被压缩，还可以防止undefined被重新赋值（新版浏览器中不能被重新赋值）,但还是习惯加上

;(function(window,undefined){
	var Tools = {
		getRandom:function (min,max){
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
	}
	window.Tools = Tools;
})(window,undefined)
//----------------------------------------------food--------------------------------------------------
;(function (window,undefined) {
	var position = 'absolute';
	//创建一个数组存储当前的食物，为后面删除食物做准备
	var elements = [];
	//随机生成颜色
	var r = Tools.getRandom(0,255);
	var g = Tools.getRandom(0,255);
	var b = Tools.getRandom(0,255);
	function Food (options){
		options = options || {};
		this.x = options.x || 0;
		this.y = options.y || 0;
		this.width = options.width || 20;
		this.height = options.height || 20;
		this.color = options.color || 'rgb('+r+','+g+','+b+')';
	}
	//将食物显示到页面上的方法
	
	Food.prototype.render = function (map){
		//先调用remove，删除之前的食物
		remove();
		var div = document.createElement('div');
		//随机生成位置
		this.x = Tools.getRandom(0,map.offsetWidth / this.width - 1)*this.width;
		this.y = Tools.getRandom(0,map.offsetHeight / this.height - 1)*this.height;
		map.appendChild(div);
		elements.push(div);
		div.style.left = this.x + 'px';
		div.style.top = this.y + 'px';
		div.style.width = this.width + 'px';
		div.style.height = this.height + 'px';
		div.style.position = position;
		div.style.backgroundColor = this.color;
	}
	
	function remove(){
		for(var i = elements.length - 1;i>=0;i--){
			//删除数组中的div元素
			elements[i].parentNode.removeChild(elements[i]);
			//删除数组元素
			elements.splice(i,1);
		}
	}
	window.Food = Food;
})(window,undefined)
//-----------------------------------------------snake---------------------------------------------
//自调用函数，开启一个新的局部作用域，防止命名冲突
;(function(window,undefined){
	//记录创建的蛇
	var elements = [];
	var position = 'absolute';
	function Snake(options){
		//蛇节的大小
		options = options || {};
		this.width = options.width || 20;
		this.height = options.height || 20;
		//蛇移动的方向
		this.direction = options.direction || 'right';
		//蛇的身体，第一节是蛇头，
		this.body = [
			{x:3, y:2, color: 'red'},
			{x:2, y:2, color: 'blue'},
			{x:1, y:2, color: 'blue'}
		];
	}
	//将蛇渲染到地图上
	Snake.prototype.render = function(map){
		//渲染前删除之前创建的蛇
		remove();
		for(var i = 0,len = this.body.length;i < len;i++){
			var object = this.body[i];
			var div = document.createElement('div');
			map.appendChild(div);
			elements.push(div);
			div.style.position = position;
			div.style.width = this.width + 'px';
			div.style.height = this.height + 'px';
			div.style.left = object.x * this.width + 'px';
			div.style.top = object.y * this.height + 'px';
			div.style.backgroundColor = object.color;
		}
	}
	//控制蛇移动的方向
	Snake.prototype.move = function(food,map){
		//控制蛇尾的移动
		for(var i = this.body.length - 1;i > 0;i--){
			this.body[i].x = this.body[i-1].x;
			this.body[i].y = this.body[i-1].y;
		}
		//控制蛇头的移动
		var head = this.body[0];
		switch(this.direction){
			case 'right':
				head.x += 1;
				break;
			case 'left':
				head.x -= 1;
				break;
			case 'top' :
				head.y -= 1;
				break;
			case 'bottom':
				head.y += 1;
				break;
			
		}
		//如果与食物相遇，则吃掉食物
		headX = head.x * this.width;
		headY = head.y * this.height
		if(headX === food.x && headY === food.y){
			//食物消失，蛇身变长
			var last = this.body[this.body.length - 1];
			var obj = {};
			extend(last,obj);
			this.body.push(obj);
			//随机生成食物
			food.render(map);
		}
	}
	function extend(parent,child){
		for(var key in parent){
			if (child[key]){
				continue;
			}
			child[key] = parent[key];
		}
	}
	function remove(){
		//要从末尾遍历，不然删除不干净
		for(var i = elements.length - 1;i >= 0;i--){
			//删除元素中的div
			elements[i].parentNode.removeChild(elements[i]);
			//删除元素
			elements.splice(i,1);
		}
		
		
	}
	
	//暴露构造函数给外部
	window.Snake = Snake;
})(window,undefined)
//----------------------------------------------------game------------------------------------------------
;(function(window,undefined){
	var that;
	function Game(map){
		this.map = map;
		this.food = new Food();
		this.snake = new Snake();
		that = this;
	}
	Game.prototype.start = function(){
		this.food.render(this.map);
		this.snake.render(this.map);
		//让蛇移动起来
		runSnake();
		//捕获键盘移动方向
		bindkey();
	}
	function runSnake(){
		var timer = setInterval(function(){
			this.snake.move(this.food,this.map);
			this.snake.render(this.map);
			//当蛇碰到边界的时候，游戏结束
			head = this.snake.body[0];
			maxX = this.map.offsetWidth / this.snake.width;
			maxY = this.map.offsetHeight / this.snake.height;
			if(head.x < 0 || head.x >= maxX){
				alert('Game Over!');
				clearInterval(timer);
			}
			if(head.y < 0 || head.y >= maxY){
				alert('Game Over!');
				clearInterval(timer);
			}
		}.bind(that),150)
		
	}
	function bindkey(){
		document.addEventListener('keydown',function(e){
			//top--38
			//bottom--40
			//left--37
			//right--39
			switch(e.keyCode){
				case 38:
					this.snake.direction = 'top';
					break;
				case 40:
					this.snake.direction = 'bottom';
					break;
				case 37:
					this.snake.direction = 'left';
					break;
				case 39:
					this.snake.direction = 'right';
					break;
			}
		}.bind(that),false)
	}
	window.Game = Game;
	
})(window,undefined)
//---------------------------------------------------------main----------------------------------------
;(function(window,undefined){
	var map = document.getElementById('map');
	var game = new Game(map);
	game.start();
})(window,undefined)