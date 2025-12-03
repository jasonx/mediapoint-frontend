import { Component } from '@angular/core';
@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.less'],
})
export class ContactUsComponent {
  center = { lat: -37.7889837, lng: 144.7842534 };
  mapOptions: google.maps.MapOptions = {
    styles: [
      {
        elementType: 'geometry',
        stylers: [{ color: '#DCE3EF' }],
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#EDEFF2' }],
      },
      {
        featureType: 'administrative.province',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#323232' }],
      },
    ],
  };
}
