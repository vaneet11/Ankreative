<template>
	<div>
		<!-- page-wrapper Start-->
		<div class="page-wrapper">
			<!-- error-404 start-->
			<div class="error-wrapper">
				<div class="container"><img class="img-100" src="../assets/images/other-images/sad.png" alt="">
					<div class="error-heading">
						<h2 class="headline font-danger">404</h2>
					</div>
					<div class="col-md-8 offset-md-2">
						<p class="sub-content">The page you are attempting to reach is currently not available. This may be because the page does not exist or has been moved.</p>
					</div>
					<div><router-link class="btn btn-danger-gradien btn-lg" :to="{ path: '/' }">BACK TO HOME PAGE</router-link></div>
				</div>
			</div>
			<!-- error-404 end-->
		</div>
	</div>
</template>
<script>
export default
{

}
</script>