$(document).ready(function(){
	(function(e){
		var options = {
			"key": "{{ api_key }}",
			"amount": cint({{ amount }} * 100), // 2000 paise = INR 20
			"name": "{{ title }}",
			"description": "{{ description }}",
			"image": "{{ brand_image }}",
			"handler": function (response){
				razorpay.make_payment_log(response, options, "{{ reference_doctype }}", "{{ reference_docname }}");
			},
			"prefill": {
				"name": "{{ payer_name }}",
				"email": "{{ payer_email }}",
				"order_id": "{{ order_id }}"
			},
			"notes": {
				"doctype": "{{ doctype }}",
				"name": "{{ name }}",
				"payment_request": "{{ name }}" // backward compatibility
			},
			"theme": {
				"color": "#4B4C9D"
			}
		};

		var rzp = new Razorpay(options);
		rzp.open();
		//	e.preventDefault();
	})();
})

frappe.provide('razorpay');

razorpay.make_payment_log = function(response, options, doctype, docname){
	$('.razorpay-loading').addClass('hidden');
	$('.razorpay-confirming').removeClass('hidden');

	frappe.call({
		method:"frappe.templates.pages.integrations.razorpay_checkout.make_payment",
		freeze:true,
		headers: {"X-Requested-With": "XMLHttpRequest"},
		args: {
			"razorpay_payment_id": response.razorpay_payment_id,
			"options": options,
			"reference_doctype": doctype,
			"reference_docname": docname
		},
		callback: function(r){
			if (r.message && r.message.status == 200) {
				window.location.href = r.message.redirect_to
			}
			else if (r.message && ([401,400,500].indexOf(r.message.status) > -1)) {
				window.location.href = r.message.redirect_to
			}
		}
	})
}
