import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { SingleOrderService } from '../single-order.service';
import { SubSink } from 'subsink';
import { BehaviorSubject, Observable, map, of, startWith } from 'rxjs';
import Fuse from 'fuse.js';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddressVerifierComponent } from 'src/app/components/address-verifier/address-verifier.component';

type AddressType = Record<string, unknown>;

@Component({
  selector: 'app-pickup-details',
  templateUrl: './pickup-details.component.html',
  styleUrls: ['./pickup-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PickupDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  addresses: Record<number, AddressType> | null = null;
  recentlyUsedAddr: number[] = [];
  restAllAddr: number[] = [];
  keysToSearch: string[] = ['name', 'address'];
  searchObject: Fuse<Record<string, unknown>> | null = null;
  control = new FormControl(null);
  filteredAddress: Observable<number[]> = of([]);
  maxAddressToShow = 7;
  showWizard = new BehaviorSubject(false);

  constructor(
    private soService: SingleOrderService,
    private dialog: MatDialog,
  ) {
    this.filteredAddress = this.control.valueChanges.pipe(
      startWith(' '),
      map((value) => this._filter(value || '')),
    );

    this.subs.sink = this.control.valueChanges.subscribe((val) => {
      if (typeof val === 'object' && val && val['id']) {
        const addrIdx = this.restAllAddr.indexOf(val['id']);

        if (addrIdx !== -1) {
          this.restAllAddr.splice(addrIdx, 1);
          this.restAllAddr.unshift(val['id']);
        }
      }
    });
  }

  ngOnInit(): void {
    this.fetchAllAddress();
  }

  fetchAllAddress() {
    this.subs.sink = of(RESP).subscribe({
      next: (resp) => {
        this.addresses = this.indexAddresses(resp.data.shipping_address);
        this.recentlyUsedAddr = resp.data.recent_addresses;
        this.restAllAddr = this.updateOtherAddress();
        this.searchObject = new Fuse(Object.values(this.addresses), {
          keys: this.keysToSearch,
        });
      },
      error: console.error,
    });
  }

  indexAddresses(shippingAddress: AddressType[]) {
    const temp: typeof this.addresses = {};
    shippingAddress.forEach((addr) => {
      temp[addr['id'] as number] = addr;
    });

    return temp;
  }

  updateOtherAddress(): number[] {
    if (!this.addresses) return [];

    return Object.keys(this.addresses)
      .filter((id) => !this.recentlyUsedAddr.includes(+id))
      .map((id) => +id);
  }

  private _filter(value: string): number[] {
    if (!this.searchObject || typeof value === 'object') {
      return [];
    }
    return this.searchObject
      .search(value)
      .map((res) => res.item['id'] as number);
  }

  displayFn(data: Record<string, unknown> | null): string {
    if (!data) {
      return '';
    }
    return `${data['name']} ${data['address']}`;
  }

  onClickNext() {
    this.soService.onTabChange('next');
  }

  onClickBack() {
    this.soService.onTabChange('prev');
  }

  openWizard() {
    this.showWizard.next(true);
  }

  openVerifyDialog(data: AddressType) {
    this.dialog.open(AddressVerifierComponent, {
      data,
      minWidth: '30%',
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

const RESP = {
  data: {
    recent_addresses: [3723228],
    shipping_address: [
      {
        id: 3723228,
        pickup_location: 'Sudip Gurgaon',
        address_type: null,
        address: 'Plot 416, Phase III, Udyog Vihar,',
        address_2: 'Sector 19, Gurugram,',
        city: 'Gurgaon',
        state: 'Haryana',
        country: 'India',
        pin_code: '122002',
        extra_info: '{"source": 1}',
        email: 'ss@gmail.com',
        is_first_mile_pickup: 0,
        phone: '9999999999',
        name: 'Sudip',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 2,
        phone_verified: 1,
        lat: '',
        long: '',
        warehouse_code: null,
        alternate_phone: '',
        rto_address_id: 3723228,
        lat_long_status: 0,
        new: 1,
        open_time: null,
        close_time: null,
        updated_address: false,
        associated_rto_address: {
          rto_address_id: 3723228,
          id: 3723228,
          pickup_location: 'Sudip Gurgaon',
          address_type: null,
          gstin: null,
          vendor_name: null,
          address: 'Plot 416, Phase III, Udyog Vihar,',
          address_2: 'Sector 19, Gurugram,',
          city: 'Gurgaon',
          state: 'Haryana',
          country: 'India',
          pin_code: '122002',
          email: 'ss@gmail.com',
          phone: '9999999999',
          name: 'Sudip',
          company_id: 474075,
          status: 2,
          phone_verified: 1,
          lat: '',
          long: '',
          warehouse_code: null,
          alternate_phone: '',
          lat_long_status: 0,
          new: 1,
        },
      },
      {
        id: 3997679,
        pickup_location: 'Dummy3',
        address_type: null,
        address: '123, rajajinagar',
        address_2: 'Rajajinagar',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        pin_code: '560001',
        email: 'pooja.ns@arvindinternet.com',
        is_first_mile_pickup: 0,
        phone: '9999999999',
        name: 'DEMO3',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 1,
        lat: null,
        long: null,
        open_time: null,
        close_time: null,
        warehouse_code: null,
        alternate_phone: null,
        rto_address_id: 3997679,
        lat_long_status: 0,
        new: 1,
        associated_rto_address: null,
      },
      {
        id: 3723302,
        pickup_location: 'Ship Rocket',
        address_type: null,
        address: '21 Udyag Vihar',
        address_2: 'Gurugram',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'Gurugram',
        state: 'Haryana',
        country: 'India',
        pin_code: '122002',
        email: 'ss@gmail.com',
        is_first_mile_pickup: 0,
        phone: '9999999999',
        name: 'Ship Rocket',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 1,
        lat: null,
        long: null,
        open_time: null,
        close_time: null,
        warehouse_code: null,
        alternate_phone: null,
        rto_address_id: 3723302,
        lat_long_status: 0,
        new: 1,
        associated_rto_address: null,
      },
      {
        id: 3476906,
        pickup_location: 'Test 3',
        address_type: null,
        address: '11 SRi Balalji Hospital',
        address_2: 'Near ghagra chowk',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'Vaishali',
        state: 'Bihar',
        country: 'India',
        pin_code: '844121',
        email: 'gulshan.kumar@shiprocket.com',
        is_first_mile_pickup: 0,
        phone: '8377984740',
        name: 'Anshu Kumar',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 1,
        lat: '',
        long: '',
        open_time: '8:00 AM',
        close_time: '8:00 PM',
        warehouse_code: null,
        alternate_phone: '',
        rto_address_id: 3476906,
        lat_long_status: 0,
        new: 1,
        associated_rto_address: null,
      },
      {
        id: 3411465,
        pickup_location: 'Shiprocket GGN',
        address_type: null,
        address: 'Shiprocket Office HQ - 416',
        address_2: 'Udyog Vihar Phase 3',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'Gurgaon',
        state: 'Haryana',
        country: 'India',
        pin_code: '122008',
        email: 'GULSHANKUMARMANIT@GMAIL.COM',
        is_first_mile_pickup: 0,
        phone: '8377984740',
        name: 'Gulshan Kumar',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 1,
        lat: '',
        long: '',
        open_time: '10:00 AM',
        close_time: '7:00 PM',
        warehouse_code: null,
        alternate_phone: '',
        rto_address_id: 3411465,
        lat_long_status: 0,
        new: 1,
        associated_rto_address: null,
      },
      {
        id: 3011412,
        pickup_location: 'HomeNew',
        address_type: null,
        address: '2324 , Radarnagar, Gandi sadak',
        address_2: 'Delli chat Bhandar',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'delhi',
        state: 'new delhi',
        country: 'india',
        pin_code: '110077',
        email: 'test@test.com',
        is_first_mile_pickup: 0,
        phone: '9879879879',
        name: 'HomeNew',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 0,
        lat: null,
        long: null,
        open_time: null,
        close_time: null,
        warehouse_code: null,
        alternate_phone: null,
        rto_address_id: 3011412,
        lat_long_status: 0,
        new: 1,
        associated_rto_address: null,
      },
      {
        id: 1980803,
        pickup_location: 'GGN-01',
        address_type: null,
        address: '433 pataudi gurgaon',
        address_2: '',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'Gurgaon',
        state: 'Haryana',
        country: 'India',
        pin_code: '122503',
        email: 'parveen.singla@shiprocket.com',
        is_first_mile_pickup: 0,
        phone: '9996351865',
        name: 'shivi',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 1,
        lat: '',
        long: '',
        open_time: null,
        close_time: null,
        warehouse_code: null,
        alternate_phone: '',
        rto_address_id: 1980803,
        lat_long_status: 0,
        new: 1,
        associated_rto_address: null,
      },
      {
        id: 1415263,
        pickup_location: 'divya',
        address_type: null,
        address: 'A11 23, ATAGHAJAK',
        address_2: '',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'South West Delhi',
        state: 'Delhi',
        country: 'india',
        pin_code: '110030',
        email: 'tyasdfhgas@hh.com',
        is_first_mile_pickup: 0,
        phone: '9650422694',
        name: 'rwerwerw',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 1,
        lat: null,
        long: null,
        open_time: null,
        close_time: null,
        warehouse_code: null,
        alternate_phone: '',
        rto_address_id: null,
        lat_long_status: 0,
        new: 1,
        associated_rto_address: null,
      },
      {
        id: 1377869,
        pickup_location: 'tyhsd dd',
        address_type: null,
        address: '673273623vqqqqqqqqqqqqqqqqqqq',
        address_2: '',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'South West Delhi',
        state: 'Delhi',
        country: 'india',
        pin_code: '110030',
        email: 'tdsgdghshg@gvhh.com',
        is_first_mile_pickup: 0,
        phone: '9650422694',
        name: 'qqqqqqqqqqqqqqqqqqqq',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 1,
        lat: '28.541809',
        long: '77.215153',
        open_time: null,
        close_time: null,
        warehouse_code: null,
        alternate_phone: '',
        rto_address_id: null,
        lat_long_status: 1,
        new: 1,
        associated_rto_address: null,
      },
      {
        id: 1377520,
        pickup_location: 'arun',
        address_type: null,
        address: 'A1224 TEST STESR',
        address_2: '',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'South West Delhi',
        state: 'Delhi',
        country: 'india',
        pin_code: '110030',
        email: 'test6777@gvgvg.com',
        is_first_mile_pickup: 0,
        phone: '6566771100',
        name: 'arun',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 0,
        lat: null,
        long: null,
        open_time: null,
        close_time: null,
        warehouse_code: null,
        alternate_phone: '',
        rto_address_id: null,
        lat_long_status: 0,
        new: 1,
        associated_rto_address: null,
      },
      {
        id: 1376897,
        pickup_location: 'soumya',
        address_type: null,
        address: '6556, BB, Block DM GHUM',
        address_2: '',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'South West Delhi',
        state: 'Delhi',
        country: 'india',
        pin_code: '110030',
        email: 'test6789@gmail.com',
        is_first_mile_pickup: 0,
        phone: '9650422694',
        name: 'soooma',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 1,
        lat: null,
        long: null,
        open_time: null,
        close_time: null,
        warehouse_code: null,
        alternate_phone: '6789045678',
        rto_address_id: null,
        lat_long_status: 0,
        new: 1,
        associated_rto_address: null,
      },
      {
        id: 1092438,
        pickup_location: 'Delhi',
        address_type: null,
        address: 'test address 27',
        address_2: '',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'West Delhi',
        state: 'Delhi',
        country: 'India',
        pin_code: '110027',
        email: 'kumar.gaurav@kartrocket.com',
        is_first_mile_pickup: 0,
        phone: '8744945644',
        name: 'test',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 1,
        lat: '28.645083',
        long: '77.113796',
        open_time: null,
        close_time: null,
        warehouse_code: null,
        alternate_phone: null,
        rto_address_id: null,
        lat_long_status: 1,
        new: 1,
        associated_rto_address: null,
      },
      {
        id: 902649,
        pickup_location: 'Sasuke',
        address_type: null,
        address: 'Shoekonnect, G-1, 2nd Floor',
        address_2: 'Bharat Nagar, New Friends Colony',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'South Delhi',
        state: 'Delhi',
        country: 'India',
        pin_code: '110025',
        email: 'ronny.rooney10@gmail.com',
        is_first_mile_pickup: 0,
        phone: '8851272064',
        name: 'Sasuke Uchiha',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 1,
        lat: '28.543454',
        long: '77.301472',
        open_time: null,
        close_time: null,
        warehouse_code: null,
        alternate_phone: null,
        rto_address_id: null,
        lat_long_status: 1,
        new: 1,
        associated_rto_address: null,
      },
      {
        id: 902625,
        pickup_location: 'test',
        address_type: null,
        address: 'test address 27',
        address_2: '',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'West Delhi',
        state: 'Delhi',
        country: 'India',
        pin_code: '110027',
        email: 'kumar.gaurav@kartrocket.com',
        is_first_mile_pickup: 0,
        phone: '8744945644',
        name: 'test',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 0,
        lat: '28.645083',
        long: '77.113796',
        open_time: null,
        close_time: null,
        warehouse_code: null,
        alternate_phone: null,
        rto_address_id: null,
        lat_long_status: 1,
        new: 1,
        associated_rto_address: null,
      },
      {
        id: 657478,
        pickup_location: 'Test1',
        address_type: 'Supplier',
        address: 'Shoekonnect, G-1, 2nd Floor,',
        address_2: 'Bharat Nagar, New Friends Colony',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'South Delhi',
        state: 'Delhi',
        country: 'India',
        pin_code: '110025',
        email: 'ronny.rooney10@gmail.com',
        is_first_mile_pickup: 0,
        phone: '8851272064',
        name: 'Sasuke Uchiha',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 1,
        lat: '28.543454',
        long: '77.301472',
        open_time: null,
        close_time: null,
        warehouse_code: null,
        alternate_phone: null,
        rto_address_id: null,
        lat_long_status: 1,
        new: 1,
        associated_rto_address: null,
      },
      {
        id: 402857,
        pickup_location: 'sftest',
        address_type: null,
        address: 'Bengaluru, Karnataka 560034, India',
        address_2: '',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        pin_code: '560034',
        email: 'test56@gmail.com',
        is_first_mile_pickup: 0,
        phone: '6677889900',
        name: 'sftest',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 1,
        lat: '12.9261382',
        long: '77.62210910000002',
        open_time: null,
        close_time: null,
        warehouse_code: null,
        alternate_phone: null,
        rto_address_id: null,
        lat_long_status: 1,
        new: 0,
        associated_rto_address: null,
      },
      {
        id: 402767,
        pickup_location: 'noida',
        address_type: null,
        address: 'Birla farm',
        address_2: '',
        updated_address: false,
        old_address: '',
        old_address2: '',
        city: 'South West Delhi',
        state: 'Delhi',
        country: 'India',
        pin_code: '110030',
        email: 'test345@gmail.com',
        is_first_mile_pickup: 0,
        phone: '6677556677',
        name: 'noida',
        company_id: 474075,
        gstin: null,
        vendor_name: null,
        status: 1,
        phone_verified: 0,
        lat: '28.4956835',
        long: '77.1664945',
        open_time: null,
        close_time: null,
        warehouse_code: null,
        alternate_phone: null,
        rto_address_id: null,
        lat_long_status: 1,
        new: 0,
        associated_rto_address: null,
      },
    ],
  },
};
