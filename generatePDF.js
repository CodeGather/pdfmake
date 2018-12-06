/* 生成PDF方法封装
 * 此方法分别依赖以下文件pdfmake.js、vfs_fonts.js、jszip.min.js、jszip-utils.js、FileSaver.js
 * 相关链接 https://github.com/CodeGather?tab=repositories
 * 第一参数支持批量以及单条数据
 * 第二参数0为下载ZIP文件、1为PDF预览、2为PDF下载、3为PDF打印
 * 第三参数为下载文件名称支持自定义名称（以及后缀选填）（不填写默认以时间戳命名）
 * 21克的爱情 
 * 2018-10-11
 */
!(function(window, document) {
	function ImageDataGeneratePDF(data, type, name) { //urls必須是字符串或字符串數組
		this.imgdata = new Array();
		this.emptyobj = new Object();
		this.totalnum = 0;
		this.data = data;
		this.type = type;
		this.name = name;
		this.isShowMap = false;    // 是否显示左侧地图信息;
		this.isShowRemarks = false;// 是否显示右侧描述信息;
		this.BigDataArrary=[];     // 右侧数据数组;
		this.dataList = [];        // 左侧数据数组;
		this.zipArray = [];        // 压缩包数据数组;
		this.lengthData = 0;
		var _this = this;
		this.config = {            // 定义左侧类型名称
				claimCode: '品牌',
				serviceName: '媒体类型',
				positionMaterial: '广告位编号',
				customerAddress: '地理（位置）',
				expectStarTime: '广告发布期',
				positionName: '点位名称',
				cityName: '城市',
				//expectStarTime: '上刊监测日期',
		}
		this.objArray = Object.keys(_this.config);
		this.option = {
			pageSize: 'A4',                 // 默认情况下我们使用portrait或者自定义
			pageOrientation: 'landscape',   // 改为横向
			pageMargins: [40, 50, 40, 20],  // [左，上，右，下]或[水平，垂直]或只是一个数字为等于边距,
			defaultStyle: {
				alignment: 'right',
				columnGap: 20
			},
			header: {
				image: 'logo-left.png',
				width: 100,
				height: 50,
				margin: [ 30, 20, 0, 0 ]
			},
			footer: {   // 底部logo图片信息
				columns: [{
					image: 'logo-left.png',
					width: 100,
					height: 20,
					margin: [-40, -40, 0, 0]
				}, {
					width: '*',
					text: ' '
				}, {
					image: 'chapter.png',
					width: 130,
					height: 70,
					margin: [100, -80, 0, 0]
				}, {
					image: 'logo-right.png',
					width: 62,
					height: 20,
					margin: [40, -40, 0, 0]
				}]
			}
		}
		pdfMake.fonts = {
			Roboto: {
				normal: 'simfang.ttf',
				bold: 'simfang.ttf',
				italics: 'simfang.ttf',
				bolditalics: 'simfang.ttf'
			}
		};
		
		/* 初始化开始 */
		this.start = function(){
			// 循环需要生成PDF的数据每一条为一页PDF
			for(var m=0;m<_this.data.length;m++){
				// 左侧数据组合
				_this.dataList[m] = [];
				_this.objArray.forEach(function(e,i){
					var colorCode = _this.dataList[m].length%2===1?'#dddddd':'#ffffff';
					_this.dataList[m].push([{
						fillColor: colorCode,
						text: _this.config[e],
						margin: [5, 5]
					},{
						text: _this.data[m][e] || '',
						fillColor: colorCode,
						margin: [5, 5],
					}]);
					
					/* 在左侧循环完最后一组时添加地图图片 */
					if( m == _this.objArray.length-1 && _this.showMap ){  
						_this.blobOrBase64(dataItem[idx], 0, function(imgData){
							if( imgData ){
								_this.dataList.push([{
									colSpan: 2,
									image: imgData,
									alignment: 'center',
									margin: [0, 10, 0, 0],
									width: 310,
									height: 180
								}])
							}
						})
					}
				})
				
				/* PDF页面的第一个对象 */
				var objData = {
					text: _this.data[m].claimCode, //'广告位信息',
					fontSize: 26,
					bold: true,
					alignment: 'left',
					margin: [0, 10, 0, 20] 
				}
				
				/* 从第二个开始需要增加 before 使其换行 */
				if( m > 0){
					objData.pageBreak = 'before';
				}
				
				/* PDF合成关键输出一页需要两个对象 */
				_this.BigDataArrary.push( objData, {
					columns: [{
						columns: [{
							layout: 'headerLineOnly',
							alignment: 'left',
							width: 340,
							color: '#222',
							table: {
								widths: [ 85, "*" ],
								body: _this.dataList[m]
							}
						}]
					}]
				})
				
				/* 循环每个订单中的图片 */
		// 			var urls = this.data[m].attachmentCover.slice(0,-1).split(',');
		// 			if (urls instanceof Array) {
		// 				this.totalnum = urls.length;
		// 				this.imgdata = new Array(this.totalnum);
		// 				_this.imgBolbOrBase64Data(urls)
		// 				for (key in urls) {
		// 					(function(item, m, key){
		// 						setTimeout(function(){
		// 							_this.getDataURL(item, m, key);
		// 							
		// 						},0)
		// 					})(urls[key], m, key)
		// 				}
		// 			} else {
		// 				this.imgdata = new Array(1);
		// 				this.totalnum = 1;
		// 				this.getDataURL(urls, 0);
		// 			}
			}
				
			/* 加载右侧数据 */
			this.imgBolbOrBase64Data(_this.data);
		};
		
		/* 图片数据工厂 */
		this.oncomplete = function (index, itemIndex) {
			// 右侧图片组合
			console.log("传递的下标："+itemIndex + "----》img的长度："+_this.imgdata.length)
			if( _this.data.length === _this.imgdata.length && _this.imgdata[_this.imgdata.length-1].length===4 ){
				console.log("数据加载完毕")
				for(var i=0; i<_this.imgdata.length; i++){
					var arrayDataImg = [];
					_this.imgdata[i].forEach(function(itemImgDate,b){
						if(!arrayDataImg[b%2]){  // 使用模2来处理分为两列并在数组中分别插入columns参数
							arrayDataImg.push({
								columns: []
							})
						}
						arrayDataImg[b%2].columns.push({
							alignment: "center",
							margin: [ 0, 10, 0, 0 ],
							width: 200,
							image: itemImgDate.data,
							height: 100
						})
					})
					_this.BigDataArrary[i*2+1].columns[0].columns.push(arrayDataImg);
				}
				_this.db.content = _this.BigDataArrary;
			}
			return _this.option;
		};
		
		/* 获取base64图片数据方法一 */
		this.getDataURL = function (url, index, itemIndex) {
			var c = document.createElement("canvas");
			var ctx = c.getContext("2d");
			var img = new Image();
			
			var protocol = document.location.protocol;
			var itemUrl = protocol+url.split(":")[1];
			
			img.src = itemUrl;
			img.crossOrigin = "*";
			img.onload = function () {
				var i;
				var maxwidth = 500;
				var scale = 1.0;
				if (img.width > maxwidth) {
					scale = maxwidth / img.width;
					c.width = maxwidth;
					c.height = Math.floor(img.height * scale);
				} else {
					c.width = img.width;
					c.height = img.height;
				}
				ctx.drawImage(img, 0, 0, c.width, c.height);
				if(!_this.imgdata[index]){
					_this.imgdata[index] = [];
				}
				_this.imgdata[index].push({
					data: c.toDataURL('image/jpeg', 0.95),
					index: index
				});
				for (i = 0; i < _this.totalnum; ++i) {
					if (_this.imgdata[i] == null) break;
				}
				if (i == _this.totalnum) {
					_this.oncomplete(index, itemIndex);
				}
			};
			img.onerror = function () {
				_this.imgdata[index] = _this.emptyobj;
				for (i = 0; i < _this.totalnum; ++i) {
					if (_this.imgdata[i] == null) break;
				}
				if (i == _this.totalnum) {
					_this.oncomplete(index, itemIndex);
				}
			};
		};
		
		/* 获取base64图片数据方法二 */
		this.blobOrBase64 = function(imgUrl, type, fn){
			window.URL = window.URL || window.webkitURL;
			var xhr = new XMLHttpRequest();
			xhr.open("get", imgUrl, true);
				// 至关重要
			xhr.responseType = "blob";
			xhr.onload = function () {
				if (this.status == 200) {
					//得到一个blob对象
					var blob = this.response;
					var oFileReader = new FileReader();
					//  至关重要
					if(type===0){
						oFileReader.onloadend = function (e) {
							fn && fn(e.target.result);
						};
					} else if(type===1){
						var blobData = window.URL.createObjectURL(blob);
						fn && fn(blobData);
					}
					oFileReader.readAsDataURL(blob);
				}
			}
			xhr.send();
		};
		
		/* 依次加载base64数据 */
		this.imgBolbOrBase64Data = function(){
			if(_this.data[_this.lengthData]){
				/* idx需要在loopData方法外创建，loopData相当于循环体
				 * arrayDataImg在每一项数据处理完成后需要清空所以同样要在循环体外声明
				 * dataItem为动态的每项数据，必要条件为_this.lengthData动态改变。
				 */
				var idx = 0;
				var arrayDataImg = [];
				var dataItem = _this.data[_this.lengthData].attachmentCover.slice(0,-1).split(',');
				function loopData(){
					if( dataItem[idx] ){
						_this.blobOrBase64(dataItem[idx], 0, function(imgData){
							if( imgData ){
								if( arrayDataImg.length < 2 ){  // 判断左右两边是否为数组否则创建并插入columns参数
									arrayDataImg.push({
										columns: []
									})
								}
								/* 在以上条件完成之后进行数据插入 */
								arrayDataImg[(idx%2)].columns.push({
									alignment: "center",
									image: imgData,
									margin: [0, 0, 0, 20],
									width: 200,
									height: 150
								})
								
								/* 判断数据的处理程度 */
								if( dataItem.length-1 === idx ){
									console.log("单项数据加载完毕");
									/* 服务ID不能为49、52插入最後一组异常描述数据 */
									if( _this.isShowRemarks && _this.data[_this.lengthData].serviceId != 49 && _this.data[_this.lengthData].serviceId!=52 ){  
											dataArrary.push({  // 右侧描述信息 数组的最后插入项目异常描述
													alignment: 'left',
													fontSize: 16,
													heights: 20,
													margin: [0, -10, 0, 0],
													ol: data.remarks.split(',')
											})
									}
									
									if(_this.lengthData===_this.data.length-1){
										console.log("所有数据加载完毕");
										_this.lengthData = 0;
										/* 所有数据处理完毕后进行content的数据插入 */
										_this.option.content = _this.BigDataArrary;
										/* 所有数据处理完毕后交给下一个方法继续处理 */
										_this.doneData(_this.option);
									} else {
										/* 单项数据完成后进行整体插入到content数据当中 */
										if(_this.BigDataArrary[_this.lengthData*2+1]){
											_this.BigDataArrary[_this.lengthData*2+1].columns[0].columns.push(arrayDataImg);
											_this.lengthData++;
											_this.imgBolbOrBase64Data(_this.data)
										}
									}
								} else {
									/* 下标的处理需要在左右两边数据处理完成后操作 */
									idx++;
									loopData(_this.data);
								}
							}
						})
					}
				}
				loopData(_this.data);
			}
		};
		
		/* 所有数据加载完毕后处理方法 */
		this.doneData = function(optionData){
			if(optionData){
				if(_this.type===0){        // 下载ZIP文件
					_this.downloadZip();
					pdfMake.createPdf(_this.option).getBlob(function(req){
						_this.zipArray.file( new Date().getTime() + '.pdf', req );
						_this.downloadZip();
					});
				} else if(_this.type===1){ // 预览
					pdfMake.createPdf(_this.option).open();
				} else if(_this.type===2){ // 下载
					var pdfName = _this.name? _this.name : new Date().getTime()+'.pdf';
					pdfMake.createPdf(_this.option).download(pdfName);
				} else if(_this.type===3){ // 打印
					pdfMake.createPdf(_this.option).print();
				}
			}
		};
		
		/* 下载ZIP 文件 */
		this.downloadZip = function(){
			_this.zipArray.generateAsync({type:"blob"}).then(function(content) {
				/*
					* 保存下载文件
					* 依赖js文件FileSaver.js
					*/
				saveAs(content, new Date().getTime()+".zip");
			}); 
		};
		
	}

	function DataGeneratePDF(data, type, name){
		this.data = data;
		this.type = type;
		this.name = name;
		this.isShowMap = false;    // 是否显示左侧地图信息;
		this.isShowRemarks = false;// 是否显示右侧描述信息;
		this.BigDataArrary=[];     // 右侧数据数组;
		this.dataList = [];        // 左侧数据数组;
		this.zipArray = [];        // 压缩包数据数组;
		this.lengthData = 0;
		this.config = {            // 定义左侧类型名称
			claimCode: '品牌',
			serviceName: '媒体类型',
			positionMaterial: '广告位编号',
			customerAddress: '地理（位置）',
			expectStarTime: '广告发布期',
			positionName: '点位名称',
			cityName: '城市',
			//expectStarTime: '上刊监测日期',
		}
		this.objArray = Object.keys(this.config);
		this.option = {
			pageSize: 'A4',                 // 默认情况下我们使用portrait或者自定义
			pageOrientation: 'landscape',   // 改为横向
			pageMargins: [40, 50, 40, 20],  // [左，上，右，下]或[水平，垂直]或只是一个数字为等于边距,
			defaultStyle: {
				alignment: 'right',
				columnGap: 20
			},
			header: {
				image: 'logo-left.png',
				width: 100,
				height: 50,
				margin: [ 30, 20, 0, 0 ]
			},
			footer: {   // 底部logo图片信息
				columns: [{
					image: 'logo-left.png',
					width: 100,
					height: 20,
					margin: [-40, -40, 0, 0]
				}, {
					width: '*',
					text: ' '
				}, {
					image: 'chapter.png',
					width: 130,
					height: 70,
					margin: [100, -80, 0, 0]
				}, {
					image: 'logo-right.png',
					width: 62,
					height: 20,
					margin: [40, -40, 0, 0]
				}]
			}
		}
		pdfMake.fonts = {
			Roboto: {
				normal: 'simfang.ttf',
				bold: 'simfang.ttf',
				italics: 'simfang.ttf',
				bolditalics: 'simfang.ttf'
			}
		};
	}

	DataGeneratePDF.prototype = {
		/* 初始化开始 */
		start:function(){
			var _this = this;
			// 循环需要生成PDF的数据每一条为一页PDF
			for(var m=0;m<_this.data.length;m++){
				// 左侧数据组合
				_this.dataList[m] = [];
				_this.objArray.forEach(function(e,i){
					var colorCode = _this.dataList[m].length%2===1?'#dddddd':'#ffffff';
					_this.dataList[m].push([{
						fillColor: colorCode,
						text: _this.config[e],
						margin: [5, 5]
					},{
						text: _this.data[m][e] || '',
						fillColor: colorCode,
						margin: [5, 5],
					}]);
					
					/* 在左侧循环完最后一组时添加地图图片 */
					if( m == _this.objArray.length-1 && _this.showMap ){  
						_this.blobOrBase64(dataItem[idx], 0, function(imgData){
							if( imgData ){
								_this.dataList.push([{
									colSpan: 2,
									image: imgData,
									alignment: 'center',
									margin: [0, 10, 0, 0],
									width: 310,
									height: 180
								}])
							}
						})
					}
				})
				
				/* PDF页面的第一个对象 */
				var objData = {
					text: _this.data[m].claimCode, //'广告位信息',
					fontSize: 26,
					bold: true,
					alignment: 'left',
					margin: [0, 10, 0, 20] 
				}
				
				/* 从第二个开始需要增加 before 使其换行 */
				if( m > 0){
					objData.pageBreak = 'before';
				}
				
				/* PDF合成关键输出一页需要两个对象 */
				_this.BigDataArrary.push( objData, {
					columns: [{
						columns: [{
							layout: 'headerLineOnly',
							alignment: 'left',
							width: 340,
							color: '#222',
							table: {
								widths: [ 85, "*" ],
								body: _this.dataList[m]
							}
						}]
					}]
				})
				
				/* 循环每个订单中的图片 */
		// 			var urls = this.data[m].attachmentCover.slice(0,-1).split(',');
		// 			if (urls instanceof Array) {
		// 				this.totalnum = urls.length;
		// 				this.imgdata = new Array(this.totalnum);
		// 				_this.imgBolbOrBase64Data(urls)
		// 				for (key in urls) {
		// 					(function(item, m, key){
		// 						setTimeout(function(){
		// 							_this.getDataURL(item, m, key);
		// 							
		// 						},0)
		// 					})(urls[key], m, key)
		// 				}
		// 			} else {
		// 				this.imgdata = new Array(1);
		// 				this.totalnum = 1;
		// 				this.getDataURL(urls, 0);
		// 			}
			}
				
			/* 加载右侧数据 */
			this.imgBolbOrBase64Data(_this.data);
		},
		/* 依次加载base64数据 */
		imgBolbOrBase64Data:function(){
			var _this = this;
			if(_this.data[_this.lengthData]){
				/* idx需要在loopData方法外创建，loopData相当于循环体
				* arrayDataImg在每一项数据处理完成后需要清空所以同样要在循环体外声明
				* dataItem为动态的每项数据，必要条件为_this.lengthData动态改变。
				*/
				var idx = 0;
				var arrayDataImg = [];
				var dataItem = _this.data[_this.lengthData].attachmentCover.slice(0,-1).split(',');
				function loopData(){
					if( dataItem[idx] ){
						_this.blobOrBase64(dataItem[idx], 0, function(imgData){
							if( imgData ){
								if( arrayDataImg.length < 2 ){  // 判断左右两边是否为数组否则创建并插入columns参数
									arrayDataImg.push({
										columns: []
									})
								}
								/* 在以上条件完成之后进行数据插入 */
								arrayDataImg[(idx%2)].columns.push({
									alignment: "center",
									image: imgData,
									margin: [0, 0, 0, 20],
									width: 200,
									height: 150
								})
								
								/* 判断数据的处理程度 */
								if( dataItem.length-1 === idx ){
									console.log("单项数据加载完毕");
									/* 服务ID不能为49、52插入最後一组异常描述数据 */
									if( _this.isShowRemarks && _this.data[_this.lengthData].serviceId != 49 && _this.data[_this.lengthData].serviceId!=52 ){  
											dataArrary.push({  // 右侧描述信息 数组的最后插入项目异常描述
													alignment: 'left',
													fontSize: 16,
													heights: 20,
													margin: [0, -10, 0, 0],
													ol: data.remarks.split(',')
											})
									}
									
									if(_this.lengthData===_this.data.length-1){
										console.log("所有数据加载完毕");
										_this.lengthData = 0;
										/* 所有数据处理完毕后进行content的数据插入 */
										_this.option.content = _this.BigDataArrary;
										/* 所有数据处理完毕后交给下一个方法继续处理 */
										_this.doneData(_this.option);
									} else {
										/* 单项数据完成后进行整体插入到content数据当中 */
										if(_this.BigDataArrary[_this.lengthData*2+1]){
											_this.BigDataArrary[_this.lengthData*2+1].columns[0].columns.push(arrayDataImg);
											_this.lengthData++;
											_this.imgBolbOrBase64Data(_this.data)
										}
									}
								} else {
									/* 下标的处理需要在左右两边数据处理完成后操作 */
									idx++;
									loopData(_this.data);
								}
							}
						})
					}
				}
				loopData(_this.data);
			}
		},
		/* 获取base64图片数据方法二 */
		blobOrBase64: function(imgUrl, type, fn){
			window.URL = window.URL || window.webkitURL;
			var xhr = new XMLHttpRequest();
			xhr.open("get", imgUrl, true);
				// 至关重要
			xhr.responseType = "blob";
			xhr.onload = function () {
				if (this.status == 200) {
					//得到一个blob对象
					var blob = this.response;
					var oFileReader = new FileReader();
					//  至关重要
					if(type===0){
						oFileReader.onloadend = function (e) {
							fn && fn(e.target.result);
						};
					} else if(type===1){
						var blobData = window.URL.createObjectURL(blob);
						fn && fn(blobData);
					}
					oFileReader.readAsDataURL(blob);
				}
			}
			xhr.send();
		},
		/* 所有数据加载完毕后处理方法 */
		doneData: function(optionData){
			var _this = this;
			if(optionData){
				if(_this.type===0){        // 下载ZIP文件
					_this.downloadZip();
					pdfMake.createPdf(_this.option).getBlob(function(req){
						_this.zipArray.file( new Date().getTime() + '.pdf', req );
						_this.downloadZip();
					});
				} else if(_this.type===1){ // 预览
					pdfMake.createPdf(_this.option).open();
				} else if(_this.type===2){ // 下载
					var pdfName = _this.name? _this.name : new Date().getTime()+'.pdf';
					pdfMake.createPdf(_this.option).download(pdfName);
				} else if(_this.type===3){ // 打印
					pdfMake.createPdf(_this.option).print();
				}
			}
		},
	}

	/* 浏览器兼容性处理 */
	if (!Object.keys) {
		Object.keys = (function () {
			var hasOwnProperty = Object.prototype.hasOwnProperty,
					hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
					dontEnums = [
						'toString',
						'toLocaleString',
						'valueOf',
						'hasOwnProperty',
						'isPrototypeOf',
						'propertyIsEnumerable',
						'constructor'
					],
					dontEnumsLength = dontEnums.length;

			return function (obj) {
				if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');

				var result = [];

				for (var prop in obj) {
					if (hasOwnProperty.call(obj, prop)) result.push(prop);
				}

				if (hasDontEnumBug) {
					for (var i=0; i < dontEnumsLength; i++) {
						if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
					}
				}
				return result;
			}
		})()
	};
  window.DataGeneratePDF = DataGeneratePDF;
})(window, document);