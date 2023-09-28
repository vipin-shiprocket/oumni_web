import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { SingleOrderService } from '../single-order.service';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable, map, of, startWith } from 'rxjs';
import Fuse from 'fuse.js';
import { SubSink } from 'subsink';
import { ToastrService } from 'ngx-toastr';
import { IBuyerDetail } from '../single-order.model';

type LooseObject = Record<string, unknown>;
const PHONE_RE = /^[6789]\d{9}$/;

@Component({
  selector: 'app-buyer-details',
  templateUrl: './buyer-details.component.html',
  styleUrls: ['./buyer-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BuyerDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  showGSTN = false;
  showShippingName = false;
  shippingIsBilling = new FormControl(null, [Validators.required]);
  addressControl = new FormControl(null);
  filteredAddress: Observable<LooseObject[]> = of([]);
  searchObject: Fuse<LooseObject> | null = null;
  addresses: LooseObject[] = [];
  keysToSearch: string[] = ['name', 'address'];
  buyerDetailForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private soService: SingleOrderService,
    private toastr: ToastrService,
  ) {
    this.buyerDetailForm = this.fb.group({
      shipping: this.fb.group({
        fullname: ['', [Validators.required]],
        phone: [null, [Validators.required, Validators.pattern(PHONE_RE)]],
        email: ['', [Validators.email]],
        altPhone: ['', [Validators.pattern(PHONE_RE)]],
        companyName: [''],
        companyGstin: [''],
        companyAddr: ['', [Validators.required]],
        landmark: [''],
        pincode: ['', [Validators.required]],
        city: ['delhi', [Validators.required]],
        state: ['delhi', [Validators.required]],
        country: ['India', [Validators.required]],
        callingCode: ['+91', [Validators.required]],
        shippingName: [''],
        shippingPhone: ['', [Validators.pattern(PHONE_RE)]],
        shippingEmail: ['', [Validators.email]],
      }),

      billing: this.fb.group({
        phone: [null, [Validators.required, Validators.pattern(PHONE_RE)]],
        fullname: ['', [Validators.required]],
        email: ['', [Validators.email]],
        companyAddr: ['', [Validators.required]],
        landmark: [''],
        pincode: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        country: ['India', [Validators.required]],
        callingCode: ['+91', [Validators.required]],
      }),

      pickupAddr: [null, [Validators.required]],
    });
    this.filteredAddress = this.addressControl.valueChanges.pipe(
      startWith(' '),
      map((value) => this._filter(value || '')),
    );

    this.subs.sink = this.addressControl.valueChanges.subscribe((value) => {
      if (this.hideAddress || !value) return;
      this.buyerDetailForm.get('pickupAddr')?.patchValue(value['id']);
    });

    this.subs.sink = this.shippingIsBilling.valueChanges.subscribe((value) => {
      const billing = this.buyerDetailForm.get('billing');
      if (value) {
        const shipping = this.buyerDetailForm.get('shipping');
        billing?.patchValue(shipping?.value);
      } else {
        billing?.reset();
      }
    });
  }

  ngOnInit(): void {
    this.fetchAllAddress();
    this.fillBuyerForm();
  }

  fillBuyerForm() {
    const { buyer } = this.soService.orderDetailDump.value ?? {};
    if (!buyer) return;

    this.buyerDetailForm.patchValue(buyer);
  }

  getShippingCtrl(ctrlName: string): AbstractControl {
    return this.buyerDetailForm
      .get('shipping')
      ?.get(ctrlName) as AbstractControl;
  }

  getBillingCtrl(ctrlName: string): AbstractControl {
    return this.buyerDetailForm
      .get('billing')
      ?.get(ctrlName) as AbstractControl;
  }

  onClickNext() {
    this.soService.onTabChange('next');
  }

  private _filter(value: string): LooseObject[] {
    if (!this.searchObject || typeof value !== 'string') return [];
    return this.searchObject.search(value).map((res) => res.item);
  }

  displayFn(data: Record<string, unknown> | null): string {
    if (!data) return '';
    return `${data['name']} ${data['address']}`;
  }

  fetchAllAddress() {
    this.subs.sink = of(ADDR_RESP).subscribe({
      next: (resp) => {
        this.addresses = resp.data.shipping_address;
        this.searchObject = new Fuse(Object.values(this.addresses), {
          keys: this.keysToSearch,
        });
      },
      error: console.error,
    });
  }

  get hideAddress(): boolean {
    return (
      !this.addressControl.value ||
      typeof this.addressControl.value !== 'object'
    );
  }

  onFormSubmit() {
    if (this.buyerDetailForm.invalid) {
      this.buyerDetailForm.markAllAsTouched();
      this.addressControl.markAllAsTouched();
      this.toastr.error(
        'Fields are missing in the form, Please check',
        'Error',
      );
      return;
    }

    this.soService.orderDetailDump.next({ buyer: this.buyerDetailForm.value });
    this.onClickNext();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

const ADDR_RESP = {
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
