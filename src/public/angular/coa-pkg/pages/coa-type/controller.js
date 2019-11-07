app.component('coaTypeList', {
    templateUrl: coa_type_list_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $element) {
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        
        var dataTable = $('#coa-type-table').dataTable({
            "dom": cndn_dom_structure,
            "language": {
                //"search": "",
                //"searchPlaceholder": "Search",
                "lengthMenu": "Rows _MENU_",
                "paginate": {
                    "next": '<i class="icon ion-ios-arrow-forward"></i>',
                    "previous": '<i class="icon ion-ios-arrow-back"></i>'
                },
            },
            stateSave: true,
            processing: true,
            serverSide: true,
            paging: true,
            searching: true,
            ordering: false,

            ajax: {
                url: laravel_routes['getCoaTypeList'],
                type: "GET",
                dataType: "json",
                data: function(d) {
                }
            },

            columns: [
                { data: 'action', searchable: false, class: 'action' },
                { data: 'name', name: 'coa_types.name', searchable: true },
                { data: 'status', searchable: false },
            ],
            rowCallback: function(row, data) {
                $(row).addClass('highlight-row');
            },
            infoCallback: function(settings, start, end, max, total, pre) {
                $('#table_info').html(total)
                $('.foot_info').html('Showing ' + start + ' to ' + end + ' of ' + max + ' entries')
            },
        });
        $('.dataTables_length select').select2();
        $("#search_coa_type").keyup(function() {
            dataTable.fnFilter(this.value);
        });

        // $scope.search_clear = function() {
        //     $('#coa-type-table').DataTable().search('').draw();
        // }
        $(".search_clear").on("click", function() {
            $('#coa-type-table').DataTable().search('').draw();
        });
    }
});

//COA-TYPE FORM

app.component('coaTypeForm', {
    templateUrl: coa_type_form_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $window, $element, $rootScope) {
        get_form_data_url = typeof($routeParams.id) == 'undefined' ? coa_type_get_form_data_url : coa_type_get_form_data_url + '/' + $routeParams.id;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        self.angular_routes = angular_routes;
        $http.get(
            get_form_data_url
        ).then(function(response) {

            self.coa_type = response.data.coa_type;
            self.action = response.data.action;
            self.title = response.data.title;
            
            if (response.data.action == "Add") {
                self.switch_value = 'Active';
            }

            if (response.data.action == "Edit") {
                if (self.coa_type.deleted_at == null) {
                    self.switch_value = 'Active';
                } else {
                    self.switch_value = 'Inactive';
                }
            }
            $rootScope.loading = false;
        });

        var form_id = '#form';
        var v = jQuery(form_id).validate({
            ignore: "",
            rules: {
                'name': {
                    required: true,
                    minlength: 3,
                    maxlength: 191,
                },
            },
            submitHandler: function(form) {
                let formData = new FormData($(form_id)[0]);
                $('#submit').button('loading');
                $.ajax({
                        url: laravel_routes['saveCoaType'],
                        method: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                    })
                    .done(function(res) {
                        // console.log(res.success);
                        if (!res.success) {
                            // $('#submit').button('reset');
                            $('#submit').prop('disabled', 'disabled');
                            var errors = '';
                            for (var i in res.errors) {
                                errors += '<li>' + res.errors[i] + '</li>';
                            }
                            new Noty({
                                type: 'error',
                                layout: 'topRight',
                                text: errors
                            }).show();
                            $('#submit').button('reset');

                        } else {
                            new Noty({
                                type: 'success',
                                layout: 'topRight',
                                text: 'Coa Type Saved Successfully',
                            }).show();
                            $('#submit').button('reset');

                            $location.path('/coa-pkg/coa-type/list')
                            $scope.$apply()
                        }
                    })
                    .fail(function(xhr) {
                        $('#submit').button('reset');
                        new Noty({
                            type: 'error',
                            layout: 'topRight',
                            text: 'Something went wrong at server',
                        }).show();
                    });
            },
        });
    }
});