import {Component, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { City } from "./city";
import { HttpService } from "./http.service";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass'],
    providers: [HttpService],
})
export class AppComponent implements OnInit {

    lengthOption: number; // Количества найденых элементов
    citys: City[] = []; // Все города полученные от сервера
    okSearch: boolean = true; // Ответ сервера
    wait: boolean = true; // Ожидание ответа от сервера
    myControl: FormControl = new FormControl();
    filteredCitys: Observable<City[]>;
    constructor (private httpService: HttpService){}

    ngOnInit() {
        this.getDataServer();
        this.filteredCitys = this.myControl.valueChanges
            .startWith(null)
            .map(val => val ? this.filter(val).slice(0, 4) : []); // Фильтрация и сокращение обьекта до 5 элементов
    }

    getDataServer () {
        this.httpService.getData() //Получаем данные с сервера
            .subscribe(
                (data) => {
                    let tmp = {} ; // Обьект для запоминания повторяющихся городов
                    this.citys = data.json().filter(city => {
                        return city.City in tmp ? 0 : tmp[city.City] = 1 ;
                    });
                    this.okSearch = true; // Статус ответа
                },
                (err: HttpErrorResponse) => { // Обработка ошибки если сервер не отвечает или запрос не дошел
                    if (!err.ok) {
                        this.okSearch = err.ok;
                    }
                },
                () => {
                    setTimeout(() =>  this.wait = false, 1000);
                }
            );

    }

    filter(val: string): City[] { // Функция фильтрации обьекта по полученному значению
        if (this.myControl.value.length >= 1) {
            const filteredCitysAll: City[] = this.citys.filter(city =>
                city.City.toLowerCase().indexOf(val.toLowerCase()) === 0);
            this.lengthOption = filteredCitysAll.length;  // запоминание максимального количества найденных элементов
            return filteredCitysAll;
        }
    }

}
