/*   Анимация зонной диаграммы и ВАХ
     p-n перехода при прямом и обратном напряжении
     Напряжение изменяется слайдером
     Носители задаются в рандомных координатах с выбранными границами
     Движение носителей зависит от приложенного напряжения
     Все построения сделаны на canvas

     Линии ОПЗ рисуются в функции Semiconductor и закомментированы
*/

console.log('start');
window.onload = function(){

// Цвета для canvas берутся из html документа (можно задать цвета этим переменным)
const vahPointFill = document.getElementById('vahPointFill').style.color,
      vahPointBorder = document.getElementById('vahPointBorder').style.color,
      vahAxes = document.getElementById('vahAxes').style.color,
      vahLine = document.getElementById('vahLine').style.color,
      holes_pp = document.getElementById('holes_pp').style.color,
      holes_pp_border = document.getElementById('holes_pp_border').style.color,
      holes_pn = document.getElementById('holes_pn').style.color,
      holes_pn_border = document.getElementById('holes_pn_border').style.color,
      electrons_nn = document.getElementById('electrons_nn').style.color,
      electrons_nn_border = document.getElementById('electrons_nn_border').style.color,
      electrons_np = document.getElementById('electrons_np').style.color,
      electrons_np_border = document.getElementById('electrons_np_border').style.color,
      opz_lines = document.getElementById('opz_lines').style.color,
      fermi_level = document.getElementById('fermi_level').style.color,
      Eg_border = document.getElementById('Eg_border').style.color,
      Eg_fill = document.getElementById('Eg_fill').style.color;


// big - размер прописан для носителей перескакивающих рандомно
// Сделано для более удобной проверки работы программы
// Можно изменить, чтобы переход рандомный был более очевиден
// balls - массив в котором будут храниться обьекты класса  ball (носители)
var
    big = 3.5,
    balls = [];


// Canvas подготавливается к работе
var canvas = document.getElementById('electrons');
var ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 500;
var width = 500;
var height = 500;
var id = 0;


// Генератор рандомных чисел в интервале от min до max
function random(min,max)
{
  var num = Math.floor(Math.random()*(max-min)) + min;
  if(num==0)
  {
      num=random(min,max)
  }
  return num;
}


// Функция для создания одного носителя
function Ball(type,id,x, y, velX, velY,minY,maxY)
{
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.size = 3.5;
  this.color = "red";
  this.b_color = "black"
  this.type = type;
  this.maxY = maxY;
  this.minY = minY;
  this.id=id;
}


// Функция рисующая носители на холсте
Ball.prototype.draw = function()
{
  ctx.beginPath();
  ctx.fillStyle = this.color;
  ctx.strokeStyle = this.b_color;
  ctx.lineWidth = 1;
  ctx.arc(this.x,this.y, this.size, 0,2*Math.PI);
  ctx.fill();
  ctx.stroke();
}


// Фунцкия определяющая пересещение носителей по холсту
Ball.prototype.update = function()
{
    var s = document.querySelector('.slider').value,
        opz = (s)/5,
        k= 1.0+0.35/140*s;
    // Рандомная смена типа при обратном смещении и без смещения
    if(s<=150)
    {
        // Рандомайзер
        let i= Math.trunc(random(0,15))

        // Без смещения электроны
        if(s==150&&(random(0,10000)==696|random(-5000,5000)>=4996))
        {
            if(balls[i].type=='nn'&&balls[i].x<=270)
            {
                balls[i].type='np';
                balls[i].size=big;

                balls[i+175].type='nn';
                balls[i+175].size=big;

            }
            else if(balls[i+175].type=='nn'&&balls[i+175].x<=280)
            {
                balls[i].type='nn';
                balls[i].size=big;                       balls[i].velX=3;                               balls[i].velY=1;

                balls[i+175].type='np';
                balls[i+175].size=big;
                balls[i+175].velX=-3;
                balls[i+175].velY=-1;

            }
        }

        // Без смещения дырки
        if((s==150&&balls[i+340].x>=230)&&(random(0,9000)==696|random(-5000,5000)>=4996))
        {
            if (balls[i+340].type=='pp')
            {
                balls[i+340].type='pn';
                balls[i+340].velY=3;
                balls[i+340].velX=3;
                balls[i+340].size=big;

                balls[i+355].type='pp';
                balls[i+355].velY=3;
                balls[i+355].velX=-2;
                balls[i+355].size=big;
            }
            else if(balls[i+340].type=='pn'&&balls[i+340].x>=270)
            {
                balls[i+340].velY=2;
                balls[i+340].velX=-3;
                balls[i+340].size=big;
                balls[i+340].type='pp';

                balls[i+355].type='pn';
                balls[i+355].velY=2;
                balls[i+355].velX=3;
                balls[i+355].size=big;
            }

        }

        // При обраном смещении Нр
        if((random(0,10000)==696&&random(-5000,5000)>=2999)&&s<150&&balls[i+175].y<=s)
        {
            balls[i+175].type='npp';
            balls[i+175].size=big;
        }

        // При обраном смещении Рн
        if((random(0,10000)==696&&random(-5000,5000)<=-2999)&&s<150&&balls[i+355].y>=500-s)
        {
            balls[i+355].type='pnn';
            balls[i+355].size=big;
        }
    }


    // Электроны | Электроны в р-типе | Электроны из p типа которые движутся при обратном смещении
    if (this.type=='nn' | this.type=='np' | this.type=='npp')
    {
        // Глобальная верхняя граница
        // Если из Р типа
        if(this.type=='np'|this.type=='npp')
        {
            this.color=electrons_np;
            this.b_color=electrons_np_border;
            // Если электроны в p типе
            if(this.x<250)
            {
                // Вехняя граница
                if(this.y<s-20+this.size)
                {this.velY=random(1,3)}
                //Нижняя граница
                if(this.y>=s-this.size)
                {this.velY=-random(1,3)}
            }
            // Если из p типа в n тип
            if(s>152|this.type=='npp')
            {
                if(s>=150)
                {
                    this.type=='np'
                    this.size=balls[0].size
                }
                // Летят налево
                this.velX=random(2,3)
                // Если в ОПЗ
                if(this.x>=250-opz*2&&this.x<=250+opz*2)
                {
                    //Быстрее летят вниз при обратном смещении
                    this.velY=random((200-s)/40,(200-s)/30);
                }
                // Если в n типе
                if(this.x>=250+opz*2)
                {
                    // Если по выстоте выше
                    if(this.y<=-s+390+this.size)
                    {this.velY=random(2,5);}
                    // Если ниже запрещенной зоны
                    if(this.y>=-s+390-this.size)
                    {this.velY=-random(1,2);}
                }
                // Если улетели направо
                if(this.x>=500)
                {
                    // Вернуться налево
                    this.x=0;
                    this.y=random(s-30,s);
                }
                // Если в p типе
                if(this.x<30)
                {
                    // Значит это рn
                    this.type='np'
                }
            }
            // Если лететь не могут
            else
            {
                // Правая граница
                if(this.x>220-opz)
                {
                    this.velX=random(-3,-1)
                }
                if(this.x>250)
                {
                    this.velX=-6;
                    this.velY=random(-3,-1);
                }
                // Левая граница
                else if(this.x<0)
                {
                    this.velX=random(1,3)
                }
                // Если в своей зоне по х
                else
                {
                    // Нижняя граница
                    if(this.y>=s)
                    {
                        this.velY=-random(2,2)
                    }
                    // Стандартный размер
                    this.size=balls[0].size;
                }
            }
        }

        // Если из n типа
        else if(this.type='nn')
        {
            this.color=electrons_nn;
            this.b_color=electrons_nn_border;

            // Нижняя граница
            if(this.y>=390-s-this.minY-this.size)
            {
                this.velY=random(-1,-2);
            }

            // Верхняя граница
            if(this.y<=390-s-this.maxY+this.size*2)
            {
               this.velY=random(1,3);
            }

            // Если могут пролетать
            if(this.y<s&&s>150)
            {
                // Летят налево
                this.velX=random(-6,-3);
                // Могут пролететь и в левой половине
                if(this.x<250)
                {
                    // Если выше 20пх высоты летят вниз
                    if(this.y<s-15)
                    {this.velY=random(1,2);}
                    // Если нет то рандомно
                    else if(this.y>=s-15&&this.y<s-this.size)
                    {this.velY=random(-0.5,2)}
                    else if(this.y>=s-this.size)
                    {this.velY=random(-0.5,1)}
                }
                // Если по высоте на границе и почти прилетели то на ней зависают
                if(this.y==s&&this.x<100)
                {
                    this.velY=-this.velY;
                }
                // Если пролетели налево
                if(this.x<0)
                {
                    this.x=500
                    this.y=random(390-s-this.minY,-s+390-this.maxY)
                    this.velY=random(-0.5,1)
                }
                //Верхняя граница
                if(this.y<=s-(this.minY+300)/5)
                {
                    this.velY=random(0.3,1);
                }
            }

            // Лететь не могут
            if(s<=150|this.y>s)
            {
                // Не внизу
                if(this.id<150 && this.x <= 260)
                {
                    this.velX=random(1,3);
                    this.velY=random(-1,-1);
                }
                // Внизу
                if(this.id>=150&&this.x<=400-opz*2)
                {
                    this.velX=3;
                    this.velY=random(-1,1);
                }
                // Середина
                if(this.id>=20&&this.id<150&&this.x<=250)
                {
                    this.velX=6;
                    this.velY=random(-1,2);
                }
                // Левая граница
                if((this.y>=(1480*2/s)*Math.sqrt(this.x-(-s)*2-406+s/2.35)-107+s)&&this.id<150)
                {
                    this.velY=random(-1,-3);
                    this.velX=random(1,3);
                }
                // Нн тип слева
                if(this.x<=100&&this.id<150)
                {
                    this.velX=random(3,4);
                    this.velY=random(-0.5,2)
                }
                if(this.x<300+opz*2&&this.y>=380-s&&s<=150)
                {
                        this.velY=random(-0.5,1);
                        this.velX=random(1,3);
                }
                // Np в N
                if((this.id>=175|(this.id<=20&&this.x<=250))&&this.x<=400&&this.x>=190)
                {
                    this.velX=6;
                    this.velY=random(1,3);
                }
                if(this.x>500+this.size)
                {
                    this.velX=random(-1,-3);
                }
                if(this.x>250+opz)
                {
                    this.size=3.5;
                }
            }
        }
    }


    // Дырки | Дырки в n-типе | Дырки из n типа которые движутся при обратном смещении
    if (this.type=='pp' | this.type=='pn'|this.type=='pnn')
    {
        if (this.type=='pn'|this.type=='pnn')
        {
            this.color=holes_pn;
            this.b_color=holes_pn_border;

            // Если в своей зоне
            if(this.x>250)
            {
                if(this.y>=-(s)+515)
                {
                    this.velY=-random(1,2)
                }
                if(this.y<=-s+500)
                {
                    this.velY=random(1,2)
                }
            }

            // Если могут лететь
            if(s>152|this.type=='pnn')
            {
                if(s>=150)
                {
                    this.type='pn'
                    this.size=balls[0].size
                }
                // Летят налево
                this.velX=random(-3,-2)
                // Если в ОПЗ
                if(this.x<=230+opz*2&&this.x>=260-opz*2)
                {
                    // Pnn летят быстрее
                    if(this.type=='pnn')
                    {
                        this.velY=random(-(200-s)/20,-(200-s)/30);
                    }
                    // Если просто Pn то им не надо так далеко лететь тк барьер ниже
                    else
                    {
                    this.velY=random(-(200-s)/35,-(200-s)/40);
                    }
                }
                // Если в Р типе
                if(this.x<=250-opz*2)
                {
                    // Pnn летят быстрее и залипают на Ev
                    if(this.type=='pnn')
                    {
                         if(this.y<=-(-s)+110+this.size)
                        {
                            this.velY=random(1,2);
                        }
                        // Если в запрещенной зоне
                        if(this.y>=-(-s)+110+3.5*this.size)
                        {
                            this.velY=random(-(200-s)/30,-(200-s)/40);
                        }
                    }
                    // Если просто Pn то им не надо так далеко лететь тк барьер ниже
                    else
                    {
                    // Если по выстоте ниже
                        if(this.y>=-(-s)+110+this.size*2)
                        {
                            this.velY=random(-2,-1);
                        }
                        // Если в запрещенной зоне
                        if(this.y<=-(-s)+110+this.size*2)
                        {
                            this.velY=random(1,2);
                        }

                    }
                }
                if(this.x<=0)
                {
                    this.x=500;
                    this.y=random(-s+500, -s+500+30);
                }
                if(this.x>470)
                {
                    this.type='pn'
                }
            }

             else
            {
               if(this.x<280+opz)
                {
                    this.velX=random(1,3)
                }
                if(this.x<270+opz)
                {
                    this.velX=6
                }
               else if(this.x>500)
                {
                    this.velX=random(-3,-1)
                }
               else
                {
                    if(this.y<=-s+500+this.size)
                    {
                        this.velY=random(2,2)
                    }
                    this.size=balls[0].size;
                }
            }
            // Без смещения и не в своей зоне
            if(s==150&&this.x<=250)
            {
                if(this.id<=355)
                {
                    this.velY = random(-1,-3);
                    this.velX = 6;
                }
                else
                {
                    this.velY = random(1,1);
                    this.velX = 6;
                }
            }
        }
        // Если просто дырки
        if (this.type=='pp')
        {
            this.color=holes_pp;
            this.b_color=holes_pp_border;
            // Прямое смещение
            if(s>150&&this.y>=500-s)
            {
                this.velX = random(3,6)
                this.velY = random(-1,2);

                // Если почти справа
                if(this.y==500-s && this.x>400)
                {
                    this.velY=-this.velY;
                    this.velX = 6
                }
                // Если в н типе
                if(this.x>=270)
                {
                    if(this.y > 515-s)
                    {
                        this.velY = random(-0.2,-0.5)
                    }
                    else if(this.y < 520-s&&this.y > 500-s+this.size)
                    {
                        this.velY= random(-0.5,1)
                    }
                    else if (this.y < 500-s+this.size)
                    {
                         this.velY= random(0.5,1)
                    }
                }
                // Если пролетели
                if(this.x>500)
                {
                    this.x=0
                    this.y = random(110-(-s)+this.minY+this.size,110-(-s)+this.maxY-this.size)
                    this.velY = random(-1,1)
                }
            }
            // Если не прямое смещение
            if(s<=150 | this.y<=500-s-1)
            {
                if(this.x>=250&&this.y>=500-s)
                {
                    //Возвращаются
                    this.velX=-4;
                    this.velY=random(-2,2);
                }
                if(this.y>=110-(-s)+this.maxY-this.size*2)
                {
                    this.velY = random(-1,-3)
                }
                if(this.y <= 110-(-s)+this.minY+this.size*2)
                {
                    this.velY = random(1,3)

                }

                // Правая изогнутая граница
                if(this.x*1.28+20>=this.y&&s>=150)
                {
                    this.velY=random(-1,3);
                    this.velX=random(-3,-1);
                }
                if(this.x+302-s/2.45>=(25-1.1*s/29)*Math.sqrt(this.y+100-(-s)+(20-s/4))&&s<=150&&this.id<=340)
                {
                    this.velY=random(-2,1);
                    this.velX=random(-3,-1);
                }
                 if(this.x+290-s/2.6+this.size>=(25-1.1*s/29)*Math.sqrt(this.y+110-(-s)+(20-s/4))&&s<=150&&this.id>=340)
                {
                    this.velY=random(-2,1);
                    this.velX=random(-3,-1);
                }
                if(this.id>=190&&this.id<=210&&(this.x*1.2+30-s/5>=this.y-15+20|(this.x>=160-opz/2&&s<=150)))
                {
                    this.velY=random(-2,1);
                    this.velX=random(-2,-1);
                }
                if(this.x<=0)
                {
                    this.velX = random(1,3)
                }
            }
            // Если не прямое смещение а они в н типе
            if(s<=150&&this.x>=250)
            {
                this.velX = -3;
                this.velY = 1;
                if(this.y>=500-s)
                {
                    this.velY = -1;
                }
            }
            // Размер на место
            if(this.x<220)
            {
                this.size=balls[0].size
            }
        }
    }


    // Обновление коодинат в соответствии с условиями
    this.x += this.velX;
    this.y += this.velY;
}


// Функция создающая массив содержащий все носители и запускающая анимацию
function loop()
{
    ctx.clearRect(0,0,1000,1000);
    // nn
    while (balls.length < 20)  {
        var ball = new Ball(
        'nn',           //type
        id,
        random(250,500),//x
        random(155,180),//y
        random(-2,2),   //velX
        random(-2,2),   //velY
        random(60,70),//minY
        random(90,90) //maxY
        );
       balls.push(ball);
       id+=1;
    }
    while (balls.length < 150) {
        var ball = new Ball(
        'nn',           //type
        id,
        random(250,500),//x
        random(190,240),//y
        random(-2,2),   //velX
        random(-2,2),   //velY
        random(15, 30),//minY
        random(60,70) //maxY
        );
        balls.push(ball);
        id+=1;
    }
    while (balls.length < 175) {
    var ball = new Ball(
        'nn',          //type
        id,
        random(250,500),//x
        random(190,240),//y
        random(-2,2),   //velX
        random(-2,2),   //velY
        random(0,5),//minY
        random(20,30) //maxY
        );
        balls.push(ball);
        id+=1;
    }
    // np
    while (balls.length < 190) {
    var ball = new Ball(
        'np',          //type
        id,
        random(0,220),//x
        random(150,160),//y
        random(-2,2),   //velX
        random(-2,2),   //velY
        random(60,70),            //minY
        random(90,90)              //maxY
        );
        balls.push(ball);
        id+=1;
    }
   // pp
    while (balls.length < 210) {
    var ball = new Ball(
       'pp',            //type
        id,
        random(0,200),  //x
        random(260,300),//y
        random(-2,2),   //velX
        random(-2,2),   //velY
        random(0,5),              //minY
        random(20,35),  //maxY
        );
        balls.push(ball);
        id+=1;
    }
    while (balls.length < 340) {
        var ball = new Ball(
       'pp',          //type
        id,
        random(0,220),//x
        random(290,320),//y
        random(-2,2),   //velX
        random(-2,2),   //velY
        random(15,35),            //minY
        random(65,75),             //maxY
        );
        balls.push(ball);
        id+=1;
    }
    while (balls.length < 355) {
    var ball = new Ball(
       'pp',          //type
        id,
        random(0,250),//x
        random(320,350),//y
        random(-2,2),   //velX
        random(-2,2),   //velY
        random(60,70) ,            //minY
        random(90,90)             //maxY
        );
        balls.push(ball);
        id+=1;
    }
    // pn
    while (balls.length < 370) {
    var ball = new Ball(
       'pn',          //type
       id,
      random(250,500),//x
      random(350,380),//y
      random(-2,2),   //velX
      random(-2,2),   //velY
      random(70,80) ,            //minY
      random(90,90)             //maxY
    );
      balls.push(ball);
      id+=1;
  }
    // Рисование и обновление
    for (var i = 0; i < balls.length; i++)
    {
        balls[i].draw();
        balls[i].update();
        //balls[i].collisionDetector();
     }
    requestAnimationFrame(loop);
}


// Рисует ВАХ s=slider.value
function VoltAmper(s)
{
    var canv = document.getElementById('canvas2');
    var c = canv.getContext('2d');
    c.clearRect(0,0,canv.width,canv.height)

    //Линия y=exp(x) задается
    c.beginPath();
    for(let i =0; i<150*2.5-200;i++)
    {
        let x=i;
        let y=-Math.exp((i-150)/8)+370;
        c.moveTo(x,y);
        x++;
        y=-Math.exp((x-150)/8)+370;
        c.lineTo(x,y);
    }
    for(let i =150*2.5-200; i<canv.width;i++)
    {
        let x=i;
        let y=-Math.exp((i-200)/10)+350;
        c.moveTo(x,y);
        x++;
        y=-Math.exp((x-200)/10)+350;
        c.lineTo(x,y);
    }
    c.lineWidth ="5"
    c.strokeStyle=vahLine;
    c.stroke();

    //Координатные оси рисуются
    c.beginPath();
    let ys = 350;
    c.moveTo(150*2.5-200,   0)
    c.lineTo(150*2.5-200, canv.height)
    c.moveTo(0,   ys);
    c.lineTo(canv.width, ys);
    c.lineWidth ="5"    
    c.strokeStyle=vahAxes;
    c.stroke();

    // Анимированная точка
    c.beginPath();
    if(s>=150)
    {
        let xs = -(-s)*2.5-200
        var pi = Math.PI;
        var exp = - Math.exp((xs-200)/10)+350;
        c.arc(xs,exp,10,0, 2*pi,true)
    }
    else
    {
        let xs = -(-s)*2.5-200
        var pi = Math.PI;
        var exp = - Math.exp((xs-150)/8)+370;
        c.arc(xs,exp,10,0, 2*pi,true)
    }
    //Анимированная точка на графике цвет и заполнение
    c.fillStyle = vahPointFill;
    c.strokeStyle = vahPointBorder;
    c.lineWidth = 1;
    c.fill();
    c.stroke();
}


// Рисует злнную картинку s=slider.value
function Semiconductor(s){
var canvas = document.getElementById('canvas1');
var ctx = canvas.getContext('2d');
var w = canvas.width;
var h = canvas.height;
    // Задает изменение ширины ОПЗ
var opz = (s)/5;
   // Задает запрещенную зону
ctx.beginPath();
    ctx.moveTo(0,s);
    ctx.lineTo(105+opz,s);
    ctx.quadraticCurveTo(160+opz,s,200+opz,55+s*3/4)
    ctx.lineTo(w-160-opz, 340-3*s/4);
    ctx.quadraticCurveTo(w-130-opz,h-110-s,w-90-opz,h-110-s)
    ctx.lineTo(w,h-110-s);
    ctx.lineTo(w,h-s);
    ctx.lineTo(w-105-opz, h-s);
    ctx.quadraticCurveTo(w-160-opz, h-s,w-190-opz,h-50-3*s/4);
    ctx.lineTo(160+opz,160+3*s/4);
    ctx.quadraticCurveTo(130+opz,110-(-s),90+opz,110-(-s));
    ctx.lineTo(-1,110-(-s));
    ctx.lineTo(-1,s);
    ctx.clearRect(0,0,w,h);
    // Рисует запрещенную зону
    ctx.lineWidth ="3";
    ctx.strokeStyle = Eg_border;
    ctx.fillStyle = Eg_fill;
    ctx.fill();
    ctx.stroke();


    //Задает и рисует линии - границы  ОПЗ
    /*ctx.beginPath();
    ctx.moveTo(w/2-opz*2+120, 0);
    ctx.lineTo(w/2-opz*2+120, h);
    ctx.moveTo(w/2+opz*2-120, 0);
    ctx.lineTo(w/2+opz*2-120, h);
    ctx.lineWidth ="1"
    ctx.strokeStyle=opz_lines;
    ctx.stroke();
    ///////////
    */


    //Задает и рисует уровень ферми
    ctx.beginPath();
    for(var f=0;f<98+opz*4.5;f=f+5)
    {
        //Левая половина
        ctx.moveTo(5-(-f) ,  s-(-100))
        f=f+5;
        ctx.lineTo(10-(-f), s-(-100))
        //Правая половина
        ctx.moveTo(w+5-f ,h-99-s)
        f=f+5;
        ctx.lineTo(w-f ,h-99-s)
    }
    ctx.strokeStyle=fermi_level;
    ctx.lineWidth ="3"
    ctx.stroke();
}


//debug
console.log('Slider value = 150 at start:')


// Вызов функций для прорисовки до использования слайдера
VoltAmper(document.querySelector('.slider').value);
Semiconductor(document.querySelector('.slider').value);
loop();


//Вывод значений напряжения и вида смещения
//QuerySelector is supported on Firefox 3.1+, IE8+ (only in IE8 standards mode), and Safari 3.1+ browsers.
//Можно использовать id или class
const slider = document.querySelector('.slider'),
voltsOutput1 = document.querySelector('.voltsI'),
voltsOutput2 = document.querySelector('.voltsII'),
smechenie = document.querySelector('.smechenie2');


//debug
if(slider == null){alert("Slider is not found. QuerySelector is supported on Firefox 3.1+, IE8+ (only in IE8 standards mode), and Safari 3.1+ browsers. Use document.getElementById('input') instead. line 26-29 925-927.")}
console.log(slider.value)
console.log(voltsOutput1.textContent)
console.log(smechenie.textContent)


// Включается слайдер
slider.addEventListener('input', () => {
      // Подгон слайдера к значениям вольт
      voltsOutput1.textContent= ((slider.value-150)*75/4000).toFixed(2);
      voltsOutput2.textContent= ((slider.value-150)*75/4000).toFixed(2);

      if(slider.value<150){smechenie.textContent = "обратное";}
      else if(slider.value>150){smechenie.textContent = "прямое"; }
      else {smechenie.textContent = "отсутствует";}

     //Анимированные графики запускаются
      VoltAmper(slider.value);
      Semiconductor(slider.value);
})
}
